"use client";

import { motion } from "framer-motion";

interface AIInsightsProps {
  insight: string;
  anomalies: { type: "spike" | "drop" | "new"; message: string; severity: "warning" | "info" }[];
}

export default function AIInsights({ insight, anomalies }: AIInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-xl p-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg
            className="w-4 h-4 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm mb-1">AI Insights</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
        </div>
      </div>

      {anomalies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 ml-11">
          {anomalies.slice(0, 4).map((anomaly, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                anomaly.severity === "warning"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  anomaly.severity === "warning" ? "bg-amber-400" : "bg-blue-400"
                }`}
              />
              {anomaly.message}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
