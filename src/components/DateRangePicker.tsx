"use client";

import { useState } from "react";
import { format, subDays, subWeeks } from "date-fns";
import { DateRange } from "@/lib/types";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  compareMode: boolean;
  onCompareModeChange: (enabled: boolean) => void;
}

const PRESETS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function DateRangePicker({
  value,
  onChange,
  compareMode,
  onCompareModeChange,
}: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState(format(value.start, "yyyy-MM-dd"));
  const [customEnd, setCustomEnd] = useState(format(value.end, "yyyy-MM-dd"));

  const activeDays = Math.round(
    (value.end.getTime() - value.start.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center bg-gray-800 rounded-lg p-1 gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              onChange({
                start: subDays(new Date("2026-02-10"), preset.days),
                end: new Date("2026-02-10"),
              });
              setShowCustom(false);
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeDays === preset.days && !showCustom
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            showCustom
              ? "bg-indigo-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-indigo-500 focus:outline-none"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => {
              onChange({
                start: new Date(customStart),
                end: new Date(customEnd),
              });
            }}
            className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      <button
        onClick={() => onCompareModeChange(!compareMode)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
          compareMode
            ? "border-amber-500 bg-amber-500/10 text-amber-400"
            : "border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
        }`}
      >
        Compare Periods
      </button>

      <span className="text-gray-500 text-sm ml-auto">
        {format(value.start, "MMM d, yyyy")} — {format(value.end, "MMM d, yyyy")}
      </span>
    </div>
  );
}
