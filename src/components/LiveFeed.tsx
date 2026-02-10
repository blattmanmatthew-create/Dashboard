"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProductColor } from "@/lib/test-data";
import type { AIEvent, Product } from "@/lib/types";

interface LiveFeedProps {
  events: AIEvent[];
}

const PRODUCT_ICONS: Record<Product, string> = {
  ChatGPT: "GP",
  "GitHub Copilot": "GC",
  Claude: "CL",
  Midjourney: "MJ",
  Gemini: "GM",
  Cursor: "CR",
};

export default function LiveFeed({ events }: LiveFeedProps) {
  const [visibleEvents, setVisibleEvents] = useState<AIEvent[]>([]);
  const indexRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start feeding events one by one
    const recentEvents = events.slice(-200);
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < recentEvents.length) {
        setVisibleEvents((prev) => {
          const next = [recentEvents[indexRef.current], ...prev].slice(0, 20);
          indexRef.current++;
          return next;
        });
      } else {
        // Loop back
        indexRef.current = 0;
      }
    }, 2000);

    // Show initial batch
    setVisibleEvents(recentEvents.slice(-5).reverse());
    indexRef.current = recentEvents.length - 5;

    return () => clearInterval(interval);
  }, [events]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-white font-semibold">Live Feed</h3>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      </div>

      <div ref={containerRef} className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {visibleEvents.map((event) => (
            <motion.div
              key={event.id + "-" + Math.random()}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 bg-gray-900/50 rounded-lg px-3 py-2.5 border border-gray-700/30"
            >
              {/* Product icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: getProductColor(event.product) + "33" }}
              >
                <span style={{ color: getProductColor(event.product) }}>
                  {PRODUCT_ICONS[event.product]}
                </span>
              </div>

              {/* Event details */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-xs truncate">{event.promptPreview}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-gray-500 text-xs">{event.group.team}</span>
                  <span className="text-gray-700">|</span>
                  <span className="text-gray-500 text-xs">{event.activityType}</span>
                </div>
              </div>

              {/* Complexity & PII badges */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    event.complexityScore === "Complex"
                      ? "bg-purple-500/20 text-purple-400"
                      : event.complexityScore === "Moderate"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {event.complexityScore}
                </span>
                {event.hasPII && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                    PII
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
