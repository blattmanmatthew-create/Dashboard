"use client";

import { motion } from "framer-motion";
import { getProductColor, getProducts } from "@/lib/test-data";
import type { Product } from "@/lib/types";

interface ProductHeatmapProps {
  data: Record<string, string | number>[];
}

export default function ProductHeatmap({ data }: ProductHeatmapProps) {
  const products = getProducts();

  // Find max value for color scaling
  let maxVal = 0;
  data.forEach((row) => {
    products.forEach((p) => {
      const val = (row[p] as number) || 0;
      if (val > maxVal) maxVal = val;
    });
  });

  const getOpacity = (value: number) => {
    if (value === 0) return 0.05;
    return 0.15 + (value / maxVal) * 0.85;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5"
    >
      <h3 className="text-white font-semibold mb-4">Product Adoption by Department</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-gray-400 font-medium py-2 pr-4 min-w-[140px]">
                Department
              </th>
              {products.map((p) => (
                <th key={p} className="text-center text-gray-400 font-medium py-2 px-2 min-w-[80px]">
                  <span className="text-xs">{p}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 12).map((row, i) => (
              <tr key={i} className="border-t border-gray-700/30">
                <td className="text-gray-300 py-2 pr-4 font-medium text-xs">
                  {row.department as string}
                </td>
                {products.map((p) => {
                  const val = (row[p] as number) || 0;
                  const color = getProductColor(p as Product);
                  return (
                    <td key={p} className="py-1.5 px-1">
                      <div
                        className="rounded-md text-center py-1.5 text-xs font-medium transition-all hover:scale-105"
                        style={{
                          backgroundColor: val > 0 ? color : "transparent",
                          opacity: getOpacity(val),
                          color: val > 0 ? "#fff" : "#6B7280",
                        }}
                      >
                        {val > 0 ? val : "—"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
