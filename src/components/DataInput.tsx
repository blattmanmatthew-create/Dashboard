"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { anonymizePrompt, classifyActivity } from "@/lib/anonymizer";
import { getProducts } from "@/lib/test-data";
import type { Product, AIEvent, GroupHierarchy } from "@/lib/types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

interface DataInputProps {
  onAddEvent: (event: AIEvent) => void;
  onBulkAdd: (events: AIEvent[]) => void;
}

const GROUPS: GroupHierarchy[] = [
  { organization: "Acme Corp", division: "Technology", department: "Engineering", team: "Platform Team", member: "user-0001" },
  { organization: "Acme Corp", division: "Technology", department: "Engineering", team: "Frontend Team", member: "user-0012" },
  { organization: "Acme Corp", division: "Product", department: "Design", team: "Visual Design", member: "user-0050" },
  { organization: "Acme Corp", division: "Business", department: "Marketing", team: "Digital Marketing", member: "user-0080" },
  { organization: "Acme Corp", division: "Data", department: "Data Science", team: "Analytics", member: "user-0100" },
];

export default function DataInput({ onAddEvent, onBulkAdd }: DataInputProps) {
  const [mode, setMode] = useState<"single" | "csv">("single");
  const [prompt, setPrompt] = useState("");
  const [product, setProduct] = useState<Product>("ChatGPT");
  const [groupIdx, setGroupIdx] = useState(0);
  const [csvData, setCsvData] = useState("");
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Live anonymization result
  const anonymResult = prompt ? anonymizePrompt(prompt) : null;
  const activityClass = prompt ? classifyActivity(prompt) : null;

  const handleSubmitSingle = () => {
    if (!prompt.trim()) return;

    const result = anonymizePrompt(prompt);
    const event: AIEvent = {
      id: `evt-manual-${generateId().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      product,
      activityType: classifyActivity(prompt) as AIEvent["activityType"],
      group: GROUPS[groupIdx],
      userId: GROUPS[groupIdx].member,
      promptPreview: result.anonymized,
      originalPrompt: result.hasPII ? prompt : undefined,
      complexityScore: prompt.length < 50 ? "Simple" : prompt.length < 150 ? "Moderate" : "Complex",
      estimatedCost: parseFloat((0.02 + Math.random() * 0.08).toFixed(4)),
      hasPII: result.hasPII,
      piiTypes: result.piiTypes.length > 0 ? result.piiTypes : undefined,
      tokenCount: Math.round(prompt.split(/\s+/).length * 1.3),
    };

    onAddEvent(event);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setPrompt("");
    }, 2000);
  };

  const handleCsvParse = () => {
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) return;

    const rows = lines.slice(1).map((line) => line.split(",").map((c) => c.trim()));
    setCsvPreview(rows.slice(0, 5));
  };

  const handleCsvImport = () => {
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) return;

    const events: AIEvent[] = lines.slice(1).map((line) => {
      const [promptText, prod, team] = line.split(",").map((c) => c.trim());
      const result = anonymizePrompt(promptText || "");
      const matchedProduct = getProducts().find((p) => p.toLowerCase() === (prod || "").toLowerCase()) || "ChatGPT";
      const matchedGroup = GROUPS.find((g) => g.team.toLowerCase().includes((team || "").toLowerCase())) || GROUPS[0];

      return {
        id: `evt-csv-${generateId().slice(0, 8)}`,
        timestamp: new Date().toISOString(),
        product: matchedProduct,
        activityType: classifyActivity(promptText || "") as AIEvent["activityType"],
        group: matchedGroup,
        userId: matchedGroup.member,
        promptPreview: result.anonymized,
        originalPrompt: result.hasPII ? promptText : undefined,
        complexityScore: (promptText || "").length < 50 ? "Simple" : (promptText || "").length < 150 ? "Moderate" : "Complex" as const,
        estimatedCost: parseFloat((0.02 + Math.random() * 0.08).toFixed(4)),
        hasPII: result.hasPII,
        piiTypes: result.piiTypes.length > 0 ? result.piiTypes : undefined,
        tokenCount: Math.round((promptText || "").split(/\s+/).length * 1.3),
      };
    });

    onBulkAdd(events);
    setCsvData("");
    setCsvPreview([]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Mode toggle */}
      <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "single" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Single Event
        </button>
        <button
          onClick={() => setMode("csv")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "csv" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          CSV Import
        </button>
      </div>

      {mode === "single" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input form */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 space-y-4">
            <h3 className="text-white font-semibold">Add Single Event</h3>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Product</label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value as Product)}
                className="w-full bg-gray-900 text-white rounded-lg px-3 py-2.5 border border-gray-700 focus:border-indigo-500 focus:outline-none"
              >
                {getProducts().map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Team</label>
              <select
                value={groupIdx}
                onChange={(e) => setGroupIdx(parseInt(e.target.value))}
                className="w-full bg-gray-900 text-white rounded-lg px-3 py-2.5 border border-gray-700 focus:border-indigo-500 focus:outline-none"
              >
                {GROUPS.map((g, i) => (
                  <option key={i} value={i}>
                    {g.division} / {g.department} / {g.team}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Type a prompt... try including names, emails, or other PII to see live anonymization"
                className="w-full bg-gray-900 text-white rounded-lg px-3 py-2.5 border border-gray-700 focus:border-indigo-500 focus:outline-none resize-none placeholder:text-gray-600"
              />
            </div>

            <button
              onClick={handleSubmitSingle}
              disabled={!prompt.trim()}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${
                submitted
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {submitted ? "Added to Dashboard!" : "Add Event"}
            </button>
          </div>

          {/* Live anonymization preview */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 space-y-4">
            <h3 className="text-white font-semibold">Live Anonymization Preview</h3>

            {prompt ? (
              <>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                    Original
                  </label>
                  <div className="bg-gray-900 rounded-lg p-3 text-sm">
                    {anonymResult?.highlights && anonymResult.highlights.length > 0 ? (
                      <HighlightedText text={prompt} highlights={anonymResult.highlights} />
                    ) : (
                      <span className="text-gray-300">{prompt}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>

                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                    Anonymized
                  </label>
                  <div className="bg-gray-900 rounded-lg p-3 text-sm text-emerald-400 font-mono">
                    {anonymResult?.anonymized || prompt}
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-gray-900 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Activity Type</p>
                    <p className="text-white text-sm font-medium">{activityClass}</p>
                  </div>
                  <div className="flex-1 bg-gray-900 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">PII Detected</p>
                    <p className={`text-sm font-medium ${anonymResult?.hasPII ? "text-red-400" : "text-emerald-400"}`}>
                      {anonymResult?.hasPII ? anonymResult.piiTypes.join(", ") : "None"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Complexity</p>
                  <p className="text-white text-sm font-medium">
                    {prompt.length < 50 ? "Simple" : prompt.length < 150 ? "Moderate" : "Complex"}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
                Start typing a prompt to see live anonymization...
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CSV mode */
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-semibold">CSV Import</h3>
          <p className="text-gray-400 text-sm">
            Format: <code className="text-indigo-400 bg-gray-900 px-1.5 py-0.5 rounded text-xs">prompt,product,team</code> (one per line, with header row)
          </p>

          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={10}
            placeholder={`prompt,product,team\n"Write a Python function for sorting",Cursor,Platform Team\n"Draft Q4 marketing plan",ChatGPT,Digital Marketing\n"Summarize the earnings call for John Smith",Claude,Analytics`}
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2.5 border border-gray-700 focus:border-indigo-500 focus:outline-none resize-none font-mono text-sm placeholder:text-gray-600"
          />

          <div className="flex gap-3">
            <button
              onClick={handleCsvParse}
              disabled={!csvData.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-40 transition-all"
            >
              Preview
            </button>
            <button
              onClick={handleCsvImport}
              disabled={!csvData.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                submitted
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40"
              }`}
            >
              {submitted ? "Imported!" : "Import All"}
            </button>
          </div>

          {csvPreview.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs">
                    <th className="text-left py-2">Prompt</th>
                    <th className="text-left py-2">Product</th>
                    <th className="text-left py-2">Team</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.map((row, i) => (
                    <tr key={i} className="border-t border-gray-700/30">
                      <td className="py-2 text-gray-300 max-w-[300px] truncate">{row[0]}</td>
                      <td className="py-2 text-gray-400">{row[1]}</td>
                      <td className="py-2 text-gray-400">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-gray-500 text-xs mt-2">
                Showing first {csvPreview.length} of {csvData.trim().split("\n").length - 1} rows
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function HighlightedText({
  text,
  highlights,
}: {
  text: string;
  highlights: { start: number; end: number; type: string; original: string }[];
}) {
  if (!highlights.length) return <span className="text-gray-300">{text}</span>;

  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const parts: React.ReactElement[] = [];
  let lastIndex = 0;

  sorted.forEach((h, i) => {
    if (h.start > lastIndex) {
      parts.push(
        <span key={`text-${i}`} className="text-gray-300">
          {text.slice(lastIndex, h.start)}
        </span>
      );
    }
    parts.push(
      <span
        key={`highlight-${i}`}
        className="bg-red-500/20 text-red-400 px-1 rounded border border-red-500/30"
        title={h.type}
      >
        {text.slice(h.start, h.end)}
      </span>
    );
    lastIndex = h.end;
  });

  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end" className="text-gray-300">
        {text.slice(lastIndex)}
      </span>
    );
  }

  return <>{parts}</>;
}
