"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { getActivityColor } from "@/lib/test-data";
import type { ActivityType } from "@/lib/types";

interface ActivityBreakdownProps {
  data: { name: string; value: number }[];
}

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
}

function CustomTreemapContent({ x = 0, y = 0, width = 0, height = 0, name = "", value = 0 }: CustomContentProps) {
  if (width < 40 || height < 30) return null;

  const color = getActivityColor(name as ActivityType);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={0.85}
        stroke="#1F2937"
        strokeWidth={2}
        rx={4}
      />
      {width > 60 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 6}
            textAnchor="middle"
            fill="#fff"
            fontSize={width > 100 ? 12 : 10}
            fontWeight="600"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 12}
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            fontSize={10}
          >
            {value.toLocaleString()}
          </text>
        </>
      )}
    </g>
  );
}

export default function ActivityBreakdown({ data }: ActivityBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5"
    >
      <h3 className="text-white font-semibold mb-4">Activity Breakdown</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="value"
            stroke="#1F2937"
            content={<CustomTreemapContent />}
          >
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number | undefined) => [value ? value.toLocaleString() : "0", "Prompts"]}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
