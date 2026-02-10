import { AIEvent, Product, ActivityType, DateRange } from "./types";
import { getProductColor } from "./test-data";
import {
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  format,
  isWithinInterval,
  subDays,
  differenceInDays,
} from "date-fns";

export function filterByDateRange(events: AIEvent[], range: DateRange): AIEvent[] {
  return events.filter((e) => {
    const d = new Date(e.timestamp);
    return isWithinInterval(d, { start: range.start, end: range.end });
  });
}

export function getHeroMetrics(events: AIEvent[], previousEvents?: AIEvent[]) {
  const totalPrompts = events.length;
  const activeUsers = new Set(events.map((e) => e.userId)).size;
  const totalCost = events.reduce((sum, e) => sum + e.estimatedCost, 0);

  // Most used product
  const productCounts: Record<string, number> = {};
  events.forEach((e) => {
    productCounts[e.product] = (productCounts[e.product] || 0) + 1;
  });
  const topProduct =
    Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Top activity
  const activityCounts: Record<string, number> = {};
  events.forEach((e) => {
    activityCounts[e.activityType] = (activityCounts[e.activityType] || 0) + 1;
  });
  const topActivity =
    Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Percentage changes
  let promptChange = 0;
  let userChange = 0;
  let costChange = 0;
  if (previousEvents && previousEvents.length > 0) {
    const prevTotal = previousEvents.length;
    const prevUsers = new Set(previousEvents.map((e) => e.userId)).size;
    const prevCost = previousEvents.reduce((sum, e) => sum + e.estimatedCost, 0);
    promptChange = prevTotal > 0 ? ((totalPrompts - prevTotal) / prevTotal) * 100 : 0;
    userChange = prevUsers > 0 ? ((activeUsers - prevUsers) / prevUsers) * 100 : 0;
    costChange = prevCost > 0 ? ((totalCost - prevCost) / prevCost) * 100 : 0;
  }

  return {
    totalPrompts,
    activeUsers,
    totalCost,
    topProduct,
    topActivity,
    promptChange,
    userChange,
    costChange,
  };
}

export function getUsageOverTime(events: AIEvent[], range: DateRange) {
  const weeks = eachWeekOfInterval({ start: range.start, end: range.end });

  return weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart);
    const weekEvents = events.filter((e) => {
      const d = new Date(e.timestamp);
      return d >= weekStart && d <= weekEnd;
    });

    const entry: Record<string, string | number> = {
      week: format(weekStart, "MMM d"),
    };

    const products: Product[] = [
      "ChatGPT",
      "GitHub Copilot",
      "Claude",
      "Midjourney",
      "Gemini",
      "Cursor",
    ];
    products.forEach((p) => {
      entry[p] = weekEvents.filter((e) => e.product === p).length;
    });

    return entry;
  });
}

export function getActivityBreakdown(events: AIEvent[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    counts[e.activityType] = (counts[e.activityType] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getProductAdoptionHeatmap(events: AIEvent[]) {
  // Get departments and their usage per product
  const deptProducts: Record<string, Record<string, number>> = {};

  events.forEach((e) => {
    const dept = e.group.department;
    if (!deptProducts[dept]) deptProducts[dept] = {};
    deptProducts[dept][e.product] = (deptProducts[dept][e.product] || 0) + 1;
  });

  return Object.entries(deptProducts).map(([department, products]) => ({
    department,
    ...products,
  }));
}

export function getGroupLeaderboard(events: AIEvent[]) {
  const teamData: Record<
    string,
    {
      team: string;
      department: string;
      division: string;
      count: number;
      users: Set<string>;
      weeklyData: number[];
    }
  > = {};

  events.forEach((e) => {
    const key = e.group.team;
    if (!teamData[key]) {
      teamData[key] = {
        team: e.group.team,
        department: e.group.department,
        division: e.group.division,
        count: 0,
        users: new Set(),
        weeklyData: new Array(12).fill(0),
      };
    }
    teamData[key].count++;
    teamData[key].users.add(e.userId);

    // Calculate week index
    const eventDate = new Date(e.timestamp);
    const startDate = new Date("2025-11-18"); // 12 weeks before Feb 10
    const weekIdx = Math.floor(differenceInDays(eventDate, startDate) / 7);
    if (weekIdx >= 0 && weekIdx < 12) {
      teamData[key].weeklyData[weekIdx]++;
    }
  });

  return Object.values(teamData)
    .map((t) => ({
      team: t.team,
      department: t.department,
      division: t.division,
      totalPrompts: t.count,
      activeUsers: t.users.size,
      promptsPerUser: Math.round(t.count / t.users.size),
      weeklyData: t.weeklyData,
    }))
    .sort((a, b) => b.totalPrompts - a.totalPrompts);
}

export function generateAIInsight(events: AIEvent[], range: DateRange): string {
  const rangeDays = differenceInDays(range.end, range.start);
  const midpoint = new Date(range.start.getTime() + (range.end.getTime() - range.start.getTime()) / 2);

  const firstHalf = events.filter((e) => new Date(e.timestamp) < midpoint);
  const secondHalf = events.filter((e) => new Date(e.timestamp) >= midpoint);

  const insights: string[] = [];

  // Product growth
  const productGrowth: Record<string, number> = {};
  const products: Product[] = ["ChatGPT", "GitHub Copilot", "Claude", "Midjourney", "Gemini", "Cursor"];
  products.forEach((p) => {
    const first = firstHalf.filter((e) => e.product === p).length;
    const second = secondHalf.filter((e) => e.product === p).length;
    if (first > 0) {
      productGrowth[p] = ((second - first) / first) * 100;
    }
  });

  const fastestGrowing = Object.entries(productGrowth).sort((a, b) => b[1] - a[1])[0];
  if (fastestGrowing && fastestGrowing[1] > 0) {
    insights.push(
      `${fastestGrowing[0]} usage grew ${Math.round(fastestGrowing[1])}% in the second half of this period`
    );
  }

  // Top division
  const divisionCounts: Record<string, number> = {};
  events.forEach((e) => {
    divisionCounts[e.group.division] = (divisionCounts[e.group.division] || 0) + 1;
  });
  const topDiv = Object.entries(divisionCounts).sort((a, b) => b[1] - a[1])[0];
  if (topDiv) {
    insights.push(`${topDiv[0]} division leads adoption with ${topDiv[1].toLocaleString()} prompts`);
  }

  // Complexity trend
  const complexEvents = events.filter((e) => e.complexityScore === "Complex");
  const complexPct = Math.round((complexEvents.length / events.length) * 100);
  if (complexPct > 15) {
    insights.push(
      `${complexPct}% of prompts are classified as complex — teams are tackling harder problems with AI`
    );
  }

  // PII flagging
  const piiCount = events.filter((e) => e.hasPII).length;
  if (piiCount > 0) {
    insights.push(
      `${piiCount} prompts were flagged for PII — review recommended in the PII tab`
    );
  }

  return insights.join(". ") + ".";
}

export function getAnomalies(events: AIEvent[]) {
  const anomalies: { type: "spike" | "drop" | "new"; message: string; severity: "warning" | "info" }[] = [];

  // Check for weekly spikes per product
  const weeklyProduct: Record<string, number[]> = {};
  events.forEach((e) => {
    const week = format(startOfWeek(new Date(e.timestamp)), "yyyy-MM-dd");
    const key = `${e.product}-${week}`;
    if (!weeklyProduct[e.product]) weeklyProduct[e.product] = [];
  });

  // Check for teams with sudden drops
  const teamWeekly: Record<string, Record<string, number>> = {};
  events.forEach((e) => {
    const week = format(startOfWeek(new Date(e.timestamp)), "yyyy-ww");
    if (!teamWeekly[e.group.team]) teamWeekly[e.group.team] = {};
    teamWeekly[e.group.team][week] = (teamWeekly[e.group.team][week] || 0) + 1;
  });

  // Product first appearances
  const productFirstWeek: Record<string, string> = {};
  events.forEach((e) => {
    const week = format(startOfWeek(new Date(e.timestamp)), "MMM d");
    if (!productFirstWeek[e.product]) productFirstWeek[e.product] = week;
  });

  Object.entries(productFirstWeek).forEach(([product, week]) => {
    anomalies.push({
      type: "new",
      message: `${product} first appeared in data starting ${week}`,
      severity: "info",
    });
  });

  return anomalies;
}

export function getPreviousPeriodEvents(
  allEvents: AIEvent[],
  range: DateRange
): AIEvent[] {
  const rangeDays = differenceInDays(range.end, range.start);
  const prevRange: DateRange = {
    start: subDays(range.start, rangeDays),
    end: subDays(range.end, rangeDays),
  };
  return filterByDateRange(allEvents, prevRange);
}
