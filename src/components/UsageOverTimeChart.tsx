"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { getProductColor } from "@/lib/test-data";
import type { Product } from "@/lib/types";

interface UsageOverTimeChartProps {
  data: Record<string, string | number>[];
}

const PRODUCTS: Product[] = [
  "ChatGPT",
  "GitHub Copilot",
  "Claude",
  "Midjourney",
  "Gemini",
  "Cursor",
];

export default function UsageOverTimeChart({ data }: UsageOverTimeChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5"
    >
      <h3 className="text-white font-semibold mb-4">Usage Over Time</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              {PRODUCTS.map((product) => (
                <linearGradient key={product} id={`gradient-${product.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getProductColor(product)} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={getProductColor(product)} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            {PRODUCTS.map((product) => (
              <Area
                key={product}
                type="monotone"
                dataKey={product}
                stackId="1"
                stroke={getProductColor(product)}
                fill={`url(#gradient-${product.replace(/\s/g, "")})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
