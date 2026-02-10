"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
}

function AnimatedNumber({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(Math.round(increment * step));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {prefix}
      {current.toLocaleString()}
      {suffix}
    </span>
  );
}

function MetricCard({ label, value, change, prefix, suffix, delay = 0 }: MetricCardProps) {
  const numericValue = typeof value === "string" ? 0 : value;
  const isNumeric = typeof value === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 hover:border-gray-600/50 transition-colors"
    >
      <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-white">
          {isNumeric ? (
            <AnimatedNumber target={numericValue} prefix={prefix} suffix={suffix} />
          ) : (
            value
          )}
        </p>
        {change !== undefined && change !== 0 && (
          <span
            className={`text-sm font-medium mb-0.5 ${
              change > 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {change > 0 ? "+" : ""}
            {Math.round(change)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface HeroMetricsProps {
  metrics: {
    totalPrompts: number;
    activeUsers: number;
    totalCost: number;
    topProduct: string;
    topActivity: string;
    promptChange: number;
    userChange: number;
    costChange: number;
  };
}

export default function HeroMetrics({ metrics }: HeroMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <MetricCard
        label="Total Prompts"
        value={metrics.totalPrompts}
        change={metrics.promptChange}
        delay={0}
      />
      <MetricCard
        label="Active Users"
        value={metrics.activeUsers}
        change={metrics.userChange}
        delay={0.1}
      />
      <MetricCard
        label="Est. Cost"
        value={Math.round(metrics.totalCost)}
        prefix="$"
        change={metrics.costChange}
        delay={0.2}
      />
      <MetricCard
        label="Top Product"
        value={metrics.topProduct}
        delay={0.3}
      />
      <MetricCard
        label="Top Activity"
        value={metrics.topActivity}
        delay={0.4}
      />
    </div>
  );
}
