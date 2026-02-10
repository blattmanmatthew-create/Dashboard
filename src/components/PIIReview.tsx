"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { getProductColor } from "@/lib/test-data";
import type { AIEvent } from "@/lib/types";

interface PIIReviewProps {
  events: AIEvent[];
  onAction: (eventId: string, action: "approve" | "redact" | "delete") => void;
}

export default function PIIReview({ events, onAction }: PIIReviewProps) {
  const [filter, setFilter] = useState<string>("all");
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());

  const piiEvents = events.filter((e) => e.hasPII);

  // Get all PII types for filtering
  const allPiiTypes = Array.from(
    new Set(piiEvents.flatMap((e) => e.piiTypes || []))
  );

  const filteredEvents = filter === "all"
    ? piiEvents
    : piiEvents.filter((e) => e.piiTypes?.includes(filter));

  const pendingCount = filteredEvents.filter((e) => !actionedIds.has(e.id)).length;

  const handleAction = (id: string, action: "approve" | "redact" | "delete") => {
    setActionedIds((prev) => new Set([...prev, id]));
    onAction(id, action);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">Total PII Flagged</p>
          <p className="text-2xl font-bold text-white mt-1">{piiEvents.length}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-400 text-sm">Pending Review</p>
          <p className="text-2xl font-bold text-white mt-1">{pendingCount}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Reviewed</p>
          <p className="text-2xl font-bold text-white mt-1">{actionedIds.size}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 text-sm">PII Types Found</p>
          <p className="text-2xl font-bold text-white mt-1">{allPiiTypes.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-400 text-sm">Filter by PII type:</span>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            filter === "all"
              ? "bg-indigo-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          All ({piiEvents.length})
        </button>
        {allPiiTypes.map((type) => {
          const count = piiEvents.filter((e) => e.piiTypes?.includes(type)).length;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filter === type
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {type} ({count})
            </button>
          );
        })}
      </div>

      {/* Event list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredEvents.map((event, i) => {
            const isActioned = actionedIds.has(event.id);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isActioned ? 0.5 : 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className={`bg-gray-800/50 backdrop-blur border rounded-xl p-5 ${
                  isActioned ? "border-gray-700/30" : "border-red-500/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                          backgroundColor: getProductColor(event.product) + "20",
                          color: getProductColor(event.product),
                        }}
                      >
                        {event.product}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {event.group.team}
                      </span>
                    </div>

                    {/* Original prompt with PII highlighted */}
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                        Original (with PII)
                      </p>
                      <div className="bg-gray-900/80 rounded-lg p-3 text-sm text-red-300 font-mono border border-red-500/10">
                        {event.originalPrompt || event.promptPreview}
                      </div>
                    </div>

                    {/* Anonymized */}
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                        Anonymized
                      </p>
                      <div className="bg-gray-900/80 rounded-lg p-3 text-sm text-emerald-400 font-mono border border-emerald-500/10">
                        {event.promptPreview}
                      </div>
                    </div>

                    {/* PII tags */}
                    <div className="flex items-center gap-2">
                      {event.piiTypes?.map((type) => (
                        <span
                          key={type}
                          className="bg-red-500/15 text-red-400 border border-red-500/20 text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {!isActioned ? (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(event.id, "approve")}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/20 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(event.id, "redact")}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-500/20 transition-all"
                      >
                        Redact
                      </button>
                      <button
                        onClick={() => handleAction(event.id, "delete")}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/20 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs px-3 py-1.5">Reviewed</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
