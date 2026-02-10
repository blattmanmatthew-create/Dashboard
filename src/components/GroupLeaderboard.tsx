"use client";

import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface TeamRow {
  team: string;
  department: string;
  division: string;
  totalPrompts: number;
  activeUsers: number;
  promptsPerUser: number;
  weeklyData: number[];
}

interface GroupLeaderboardProps {
  data: TeamRow[];
}

function Sparkline({ data }: { data: number[] }) {
  const chartData = data.map((v, i) => ({ v }));
  const trend = data[data.length - 1] > data[Math.max(0, data.length - 4)];

  return (
    <div className="w-24 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={trend ? "#10B981" : "#EF4444"}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function GroupLeaderboard({ data }: GroupLeaderboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5"
    >
      <h3 className="text-white font-semibold mb-4">Team Leaderboard</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left py-2 font-medium">#</th>
              <th className="text-left py-2 font-medium">Team</th>
              <th className="text-left py-2 font-medium hidden md:table-cell">Department</th>
              <th className="text-right py-2 font-medium">Prompts</th>
              <th className="text-right py-2 font-medium">Users</th>
              <th className="text-right py-2 font-medium hidden sm:table-cell">Per User</th>
              <th className="text-right py-2 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, i) => (
              <motion.tr
                key={row.team}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="border-t border-gray-700/30 hover:bg-gray-700/20 transition-colors"
              >
                <td className="py-2.5 text-gray-500 font-mono text-xs">{i + 1}</td>
                <td className="py-2.5">
                  <span className="text-white font-medium">{row.team}</span>
                </td>
                <td className="py-2.5 text-gray-400 hidden md:table-cell">{row.department}</td>
                <td className="py-2.5 text-right text-white font-mono">
                  {row.totalPrompts.toLocaleString()}
                </td>
                <td className="py-2.5 text-right text-gray-300 font-mono">{row.activeUsers}</td>
                <td className="py-2.5 text-right text-gray-300 font-mono hidden sm:table-cell">
                  {row.promptsPerUser}
                </td>
                <td className="py-2.5 flex justify-end">
                  <Sparkline data={row.weeklyData} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
