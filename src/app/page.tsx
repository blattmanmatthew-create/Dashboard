"use client";

import { useState, useMemo, useCallback } from "react";
import { subDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { getTestData } from "@/lib/test-data";
import {
  filterByDateRange,
  getHeroMetrics,
  getUsageOverTime,
  getActivityBreakdown,
  getProductAdoptionHeatmap,
  getGroupLeaderboard,
  generateAIInsight,
  getAnomalies,
  getPreviousPeriodEvents,
} from "@/lib/analytics";
import type { TabType, DateRange, AIEvent } from "@/lib/types";

import DateRangePicker from "@/components/DateRangePicker";
import HeroMetrics from "@/components/HeroMetrics";
import AIInsights from "@/components/AIInsights";
import UsageOverTimeChart from "@/components/UsageOverTimeChart";
import ActivityBreakdown from "@/components/ActivityBreakdown";
import ProductHeatmap from "@/components/ProductHeatmap";
import GroupLeaderboard from "@/components/GroupLeaderboard";
import LiveFeed from "@/components/LiveFeed";
import DataInput from "@/components/DataInput";
import PIIReview from "@/components/PIIReview";

const TABS: { id: TabType; label: string; count?: boolean }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "data-input", label: "Data Input" },
  { id: "pii-review", label: "PII Review", count: true },
];

export default function Home() {
  const [allEvents, setAllEvents] = useState<AIEvent[]>(() => getTestData());
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date("2026-02-10"), 30),
    end: new Date("2026-02-10"),
  });
  const [compareMode, setCompareMode] = useState(false);

  const filteredEvents = useMemo(
    () => filterByDateRange(allEvents, dateRange),
    [allEvents, dateRange]
  );

  const previousEvents = useMemo(
    () => getPreviousPeriodEvents(allEvents, dateRange),
    [allEvents, dateRange]
  );

  const metrics = useMemo(
    () => getHeroMetrics(filteredEvents, compareMode ? previousEvents : undefined),
    [filteredEvents, previousEvents, compareMode]
  );

  const usageData = useMemo(
    () => getUsageOverTime(filteredEvents, dateRange),
    [filteredEvents, dateRange]
  );

  const activityData = useMemo(
    () => getActivityBreakdown(filteredEvents),
    [filteredEvents]
  );

  const heatmapData = useMemo(
    () => getProductAdoptionHeatmap(filteredEvents),
    [filteredEvents]
  );

  const leaderboardData = useMemo(
    () => getGroupLeaderboard(filteredEvents),
    [filteredEvents]
  );

  const insight = useMemo(
    () => generateAIInsight(filteredEvents, dateRange),
    [filteredEvents, dateRange]
  );

  const anomalies = useMemo(
    () => getAnomalies(filteredEvents),
    [filteredEvents]
  );

  const piiCount = useMemo(
    () => allEvents.filter((e) => e.hasPII).length,
    [allEvents]
  );

  const handleAddEvent = useCallback((event: AIEvent) => {
    setAllEvents((prev) => [...prev, event]);
  }, []);

  const handleBulkAdd = useCallback((events: AIEvent[]) => {
    setAllEvents((prev) => [...prev, ...events]);
  }, []);

  const handlePIIAction = useCallback(
    (eventId: string, action: "approve" | "redact" | "delete") => {
      if (action === "delete") {
        setAllEvents((prev) => prev.filter((e) => e.id !== eventId));
      }
      // approve and redact are handled in the component UI state
    },
    []
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">AI Tools Dashboard</h1>
                <p className="text-xs text-gray-500">Organization-wide AI usage analytics</p>
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex items-center bg-gray-800/50 rounded-lg p-1 gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {tab.label}
                  {tab.count && piiCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {piiCount > 99 ? "99+" : piiCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Date range picker - only on dashboard tab */}
          {activeTab === "dashboard" && (
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              compareMode={compareMode}
              onCompareModeChange={setCompareMode}
            />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <HeroMetrics metrics={metrics} />
              <AIInsights insight={insight} anomalies={anomalies} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UsageOverTimeChart data={usageData} />
                <ActivityBreakdown data={activityData} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProductHeatmap data={heatmapData} />
                <GroupLeaderboard data={leaderboardData} />
              </div>

              <LiveFeed events={filteredEvents} />
            </motion.div>
          )}

          {activeTab === "data-input" && (
            <motion.div
              key="data-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DataInput onAddEvent={handleAddEvent} onBulkAdd={handleBulkAdd} />
            </motion.div>
          )}

          {activeTab === "pii-review" && (
            <motion.div
              key="pii-review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PIIReview events={allEvents} onAction={handlePIIAction} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
