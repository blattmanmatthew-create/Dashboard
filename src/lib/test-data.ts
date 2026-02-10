import { AIEvent, Product, ActivityType, GroupHierarchy } from "./types";

// ── Product configurations ─────────────────────────────────────────────
const PRODUCT_CONFIG: Record<
  Product,
  { activities: ActivityType[]; costPerPrompt: number; avgTokens: number }
> = {
  ChatGPT: {
    activities: ["Writing", "Research", "Brainstorming", "Summarization", "Translation", "Editing"],
    costPerPrompt: 0.03,
    avgTokens: 850,
  },
  "GitHub Copilot": {
    activities: ["Code Generation", "Code Review", "Debugging", "Documentation"],
    costPerPrompt: 0.02,
    avgTokens: 400,
  },
  Claude: {
    activities: ["Data Analysis", "Writing", "Code Generation", "Research", "Summarization"],
    costPerPrompt: 0.05,
    avgTokens: 1200,
  },
  Midjourney: {
    activities: ["Image Generation", "Design", "Brainstorming"],
    costPerPrompt: 0.08,
    avgTokens: 150,
  },
  Gemini: {
    activities: ["Research", "Data Analysis", "Summarization", "Translation"],
    costPerPrompt: 0.025,
    avgTokens: 900,
  },
  Cursor: {
    activities: ["Code Generation", "Refactoring", "Debugging", "Code Review", "Documentation"],
    costPerPrompt: 0.04,
    avgTokens: 600,
  },
};

// ── Group hierarchy ────────────────────────────────────────────────────
const ORG_STRUCTURE = {
  "Acme Corp": {
    "Technology": {
      "Engineering": {
        "Platform Team": 12,
        "Frontend Team": 8,
        "Backend Team": 10,
        "ML Team": 6,
      },
      "IT Operations": {
        "Infrastructure": 5,
        "Security": 4,
        "Support": 7,
      },
    },
    "Product": {
      "Product Management": {
        "Core Product": 5,
        "Growth": 4,
        "Enterprise": 3,
      },
      "Design": {
        "UX Research": 4,
        "Visual Design": 5,
        "Content Design": 3,
      },
    },
    "Business": {
      "Marketing": {
        "Brand": 4,
        "Digital Marketing": 6,
        "Content": 5,
      },
      "Sales": {
        "Enterprise Sales": 8,
        "SMB Sales": 6,
        "Sales Ops": 3,
      },
    },
    "Data": {
      "Data Science": {
        "Analytics": 5,
        "ML Research": 4,
        "Data Engineering": 6,
      },
      "Business Intelligence": {
        "Reporting": 4,
        "Strategy": 3,
      },
    },
    "Operations": {
      "Finance": {
        "Accounting": 4,
        "FP&A": 3,
      },
      "HR": {
        "Recruiting": 5,
        "People Ops": 4,
        "L&D": 3,
      },
      "Legal": {
        "Compliance": 3,
        "Contracts": 4,
      },
    },
  },
};

// ── Product preference weights by department ───────────────────────────
const DEPT_PRODUCT_WEIGHTS: Record<string, Partial<Record<Product, number>>> = {
  "Engineering": { "GitHub Copilot": 5, Cursor: 4, Claude: 3, ChatGPT: 1 },
  "Platform Team": { "GitHub Copilot": 5, Cursor: 5, Claude: 3 },
  "Frontend Team": { Cursor: 5, "GitHub Copilot": 4, ChatGPT: 2, Claude: 2 },
  "Backend Team": { "GitHub Copilot": 5, Cursor: 4, Claude: 3 },
  "ML Team": { Claude: 5, ChatGPT: 3, "GitHub Copilot": 4, Cursor: 2 },
  "IT Operations": { ChatGPT: 3, Claude: 2, "GitHub Copilot": 1 },
  "Product Management": { ChatGPT: 4, Claude: 3, Gemini: 2 },
  "Design": { Midjourney: 5, ChatGPT: 3, Claude: 2 },
  "UX Research": { ChatGPT: 4, Claude: 3, Gemini: 2 },
  "Visual Design": { Midjourney: 6, ChatGPT: 2, Claude: 1 },
  "Content Design": { ChatGPT: 5, Claude: 3 },
  "Marketing": { ChatGPT: 5, Midjourney: 3, Claude: 2, Gemini: 2 },
  "Brand": { Midjourney: 5, ChatGPT: 4 },
  "Digital Marketing": { ChatGPT: 5, Gemini: 3, Claude: 2 },
  "Content": { ChatGPT: 5, Claude: 4, Gemini: 2 },
  "Sales": { ChatGPT: 4, Claude: 2, Gemini: 2 },
  "Data Science": { Claude: 5, ChatGPT: 3, Gemini: 3, Cursor: 2 },
  "Analytics": { Claude: 4, Gemini: 3, ChatGPT: 2 },
  "ML Research": { Claude: 5, ChatGPT: 3, "GitHub Copilot": 3 },
  "Data Engineering": { "GitHub Copilot": 4, Cursor: 3, Claude: 3 },
  "Business Intelligence": { Gemini: 4, ChatGPT: 3, Claude: 2 },
  "Finance": { ChatGPT: 3, Gemini: 3, Claude: 2 },
  "HR": { ChatGPT: 4, Claude: 2, Gemini: 1 },
  "Legal": { Claude: 4, ChatGPT: 3 },
};

// ── Anonymized prompt templates ────────────────────────────────────────
const PROMPT_TEMPLATES: Record<ActivityType, string[]> = {
  "Code Generation": [
    "Write a [LANGUAGE] function that [ACTION] for [COMPONENT]",
    "Create a REST API endpoint for [RESOURCE] with [FRAMEWORK]",
    "Implement [PATTERN] pattern for the [MODULE] service",
    "Generate unit tests for the [COMPONENT] class",
    "Build a [TYPE] component that handles [FEATURE]",
  ],
  "Code Review": [
    "Review this [LANGUAGE] code for [CONCERN] issues",
    "Check this PR for potential [TYPE] vulnerabilities",
    "Analyze the performance of this [COMPONENT] implementation",
    "Suggest improvements for this [PATTERN] implementation",
  ],
  Debugging: [
    "Fix the [ERROR_TYPE] error in the [COMPONENT] module",
    "Debug why [FEATURE] returns [INCORRECT_RESULT] in [ENVIRONMENT]",
    "Trace the [TYPE] issue in the [SERVICE] pipeline",
    "Resolve the [ERROR] when [ACTION] in [COMPONENT]",
  ],
  Writing: [
    "Draft a [DOCUMENT_TYPE] about [TOPIC] for [AUDIENCE]",
    "Write [CONTENT_TYPE] copy for the [CAMPAIGN] campaign",
    "Compose a [FORMAT] explaining [TOPIC] to [STAKEHOLDER]",
    "Create [TYPE] content for [CHANNEL] targeting [SEGMENT]",
  ],
  Editing: [
    "Improve the clarity of this [DOCUMENT_TYPE] about [TOPIC]",
    "Proofread and edit this [CONTENT_TYPE] for [AUDIENCE]",
    "Revise this [FORMAT] to be more [QUALITY] for [PURPOSE]",
  ],
  Research: [
    "Research [TOPIC] trends in [INDUSTRY] for [PERIOD]",
    "Compare [OPTION_A] vs [OPTION_B] for [USE_CASE]",
    "Summarize recent [FIELD] developments related to [TOPIC]",
    "Find best practices for [TOPIC] in [CONTEXT]",
  ],
  Brainstorming: [
    "Generate ideas for [PROJECT] targeting [AUDIENCE]",
    "Brainstorm [TYPE] approaches to solve [PROBLEM]",
    "Suggest [NUMBER] creative concepts for [INITIATIVE]",
    "Explore options for improving [METRIC] in [AREA]",
  ],
  "Data Analysis": [
    "Analyze [DATASET] to find [PATTERN] trends over [PERIOD]",
    "Calculate [METRIC] by [DIMENSION] from [SOURCE] data",
    "Build a [TYPE] model to predict [OUTCOME] from [FEATURES]",
    "Identify [ANOMALY_TYPE] in the [DATASET] for [PERIOD]",
  ],
  Summarization: [
    "Summarize the [PERIOD] [DOCUMENT_TYPE] for [ENTITY]",
    "Create an executive summary of [REPORT] findings",
    "Condense this [LENGTH] [DOCUMENT_TYPE] into key points",
    "TL;DR this [TYPE] discussion about [TOPIC]",
  ],
  "Image Generation": [
    "Create a [STYLE] illustration of [SUBJECT] for [USE_CASE]",
    "Design a [FORMAT] banner for the [CAMPAIGN] campaign",
    "Generate [NUMBER] variations of [ASSET_TYPE] for [PROJECT]",
    "Produce a [STYLE] image of [SUBJECT] with [MOOD] feel",
  ],
  Design: [
    "Create a [TYPE] mockup for the [FEATURE] page",
    "Design a [STYLE] icon set for [CONTEXT]",
    "Generate [TYPE] assets for the [PROJECT] rebrand",
    "Produce a [FORMAT] layout for [CONTENT_TYPE]",
  ],
  Translation: [
    "Translate this [DOCUMENT_TYPE] from [LANG_A] to [LANG_B]",
    "Localize [CONTENT_TYPE] for the [REGION] market",
    "Convert this [TYPE] content to [LANGUAGE] for [AUDIENCE]",
  ],
  Refactoring: [
    "Refactor the [COMPONENT] to use [PATTERN] pattern",
    "Simplify the [MODULE] by extracting [CONCEPT]",
    "Modernize the [COMPONENT] from [OLD_APPROACH] to [NEW_APPROACH]",
    "Optimize [FUNCTION] for better [METRIC] performance",
  ],
  Documentation: [
    "Write API docs for the [SERVICE] endpoints",
    "Create a README for the [PROJECT] repository",
    "Document the [PROCESS] workflow for [AUDIENCE]",
    "Generate JSDoc comments for the [MODULE] module",
  ],
};

// ── PII prompt templates (flagged) ─────────────────────────────────────
const PII_PROMPTS: { original: string; anonymized: string; piiTypes: string[] }[] = [
  {
    original: "Summarize the Q3 earnings call for John Smith at Acme Corp",
    anonymized: "Summarize the [PERIOD] [DOCUMENT_TYPE] for [PERSON] at [ENTITY]",
    piiTypes: ["Person Name", "Organization"],
  },
  {
    original: "Draft an email to sarah.jones@company.com about the project delay",
    anonymized: "Draft an [FORMAT] to [EMAIL] about the [TOPIC]",
    piiTypes: ["Email Address"],
  },
  {
    original: "Process the invoice for account 4532-1234-5678-9012",
    anonymized: "Process the [DOCUMENT_TYPE] for account [CREDIT_CARD]",
    piiTypes: ["Credit Card Number"],
  },
  {
    original: "Look up employee record for SSN 123-45-6789",
    anonymized: "Look up [RECORD_TYPE] for SSN [SSN]",
    piiTypes: ["Social Security Number"],
  },
  {
    original: "Send the contract to Mike Johnson at 123 Main St, Springfield",
    anonymized: "Send the [DOCUMENT_TYPE] to [PERSON] at [ADDRESS]",
    piiTypes: ["Person Name", "Address"],
  },
  {
    original: "Schedule a meeting with Dr. Emily Chen for patient ID P-98234",
    anonymized: "Schedule a [EVENT] with [PERSON] for patient ID [PATIENT_ID]",
    piiTypes: ["Person Name", "Medical ID"],
  },
  {
    original: "Generate a report for user maria.garcia@email.com with phone 555-0142",
    anonymized: "Generate a [REPORT_TYPE] for user [EMAIL] with phone [PHONE]",
    piiTypes: ["Email Address", "Phone Number"],
  },
  {
    original: "Review the tax return for David Lee, DOB 03/15/1985",
    anonymized: "Review the [DOCUMENT_TYPE] for [PERSON], DOB [DATE_OF_BIRTH]",
    piiTypes: ["Person Name", "Date of Birth"],
  },
  {
    original: "Update the records for employee badge #A4521 Robert Kim",
    anonymized: "Update the records for employee badge [BADGE_ID] [PERSON]",
    piiTypes: ["Person Name", "Employee ID"],
  },
  {
    original: "File a claim for policy holder Jennifer Wu, policy #HLT-2024-88923",
    anonymized: "File a [REQUEST_TYPE] for policy holder [PERSON], policy [POLICY_ID]",
    piiTypes: ["Person Name", "Policy Number"],
  },
];

// ── Seeded random ──────────────────────────────────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function weightedPick<T>(items: T[], weights: number[], rand: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ── Main generator ─────────────────────────────────────────────────────
export function generateTestData(count: number = 12000, seed: number = 42): AIEvent[] {
  const rand = seededRandom(seed);
  const events: AIEvent[] = [];

  // Build member list
  interface Member {
    group: GroupHierarchy;
    preferredProducts: { product: Product; weight: number }[];
  }
  const members: Member[] = [];

  for (const [org, divisions] of Object.entries(ORG_STRUCTURE)) {
    for (const [division, departments] of Object.entries(divisions)) {
      for (const [department, teams] of Object.entries(departments)) {
        for (const [team, memberCount] of Object.entries(teams as Record<string, number>)) {
          for (let i = 0; i < memberCount; i++) {
            const memberId = `user-${members.length.toString().padStart(4, "0")}`;
            const group: GroupHierarchy = {
              organization: org,
              division,
              department,
              team,
              member: memberId,
            };

            // Determine product preferences from hierarchy
            const weights: Partial<Record<Product, number>> = {
              ...(DEPT_PRODUCT_WEIGHTS[department] || {}),
              ...(DEPT_PRODUCT_WEIGHTS[team] || {}),
            };
            const preferredProducts = Object.entries(weights).map(([p, w]) => ({
              product: p as Product,
              weight: w,
            }));
            if (preferredProducts.length === 0) {
              preferredProducts.push(
                { product: "ChatGPT", weight: 3 },
                { product: "Claude", weight: 2 }
              );
            }

            members.push({ group, preferredProducts });
          }
        }
      }
    }
  }

  // Time range: 12 weeks ending today
  const endDate = new Date("2026-02-10");
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 84); // 12 weeks

  // Adoption curve: usage grows over the 12 weeks
  const getAdoptionMultiplier = (weekIndex: number): number => {
    // S-curve adoption
    return 0.3 + 0.7 * (1 / (1 + Math.exp(-0.5 * (weekIndex - 4))));
  };

  // Spike events (simulated rollouts)
  const spikeWeeks: Record<Product, number> = {
    ChatGPT: -1, // already adopted
    "GitHub Copilot": 2,
    Claude: 5,
    Midjourney: 3,
    Gemini: 7,
    Cursor: 9,
  };

  let eventId = 0;

  for (let i = 0; i < count; i++) {
    // Pick a random member
    const member = members[Math.floor(rand() * members.length)];

    // Pick a product based on member preferences
    const product = weightedPick(
      member.preferredProducts.map((p) => p.product),
      member.preferredProducts.map((p) => p.weight),
      rand
    );

    // Pick a random timestamp within the 12-week range
    const weekIndex = Math.floor(rand() * 12);
    const dayInWeek = Math.floor(rand() * 7);
    const hour = Math.floor(rand() * 10) + 8; // 8am - 6pm
    const minute = Math.floor(rand() * 60);

    // Apply adoption curve
    const adoption = getAdoptionMultiplier(weekIndex);
    if (rand() > adoption) continue;

    // Apply weekday bias (70% weekday, 30% weekend)
    if (dayInWeek >= 5 && rand() > 0.3) continue;

    // Apply product spike
    const spikeWeek = spikeWeeks[product];
    if (spikeWeek >= 0 && weekIndex < spikeWeek && rand() > 0.15) continue;
    const isSpikeWeek = spikeWeek >= 0 && weekIndex === spikeWeek;

    const timestamp = new Date(startDate);
    timestamp.setDate(timestamp.getDate() + weekIndex * 7 + dayInWeek);
    timestamp.setHours(hour, minute, Math.floor(rand() * 60));

    // Pick activity
    const config = PRODUCT_CONFIG[product];
    const activity = config.activities[Math.floor(rand() * config.activities.length)];

    // PII check (~3% of prompts contain PII)
    const hasPII = rand() < 0.03;
    let promptPreview: string;
    let originalPrompt: string | undefined;
    let piiTypes: string[] | undefined;

    if (hasPII) {
      const piiEntry = PII_PROMPTS[Math.floor(rand() * PII_PROMPTS.length)];
      promptPreview = piiEntry.anonymized;
      originalPrompt = piiEntry.original;
      piiTypes = piiEntry.piiTypes;
    } else {
      const templates = PROMPT_TEMPLATES[activity];
      promptPreview = templates[Math.floor(rand() * templates.length)];
    }

    // Complexity
    const complexityRoll = rand();
    const complexityScore =
      complexityRoll < 0.4 ? "Simple" : complexityRoll < 0.8 ? "Moderate" : "Complex";

    // Token count varies by complexity
    const tokenMultiplier =
      complexityScore === "Simple" ? 0.5 : complexityScore === "Moderate" ? 1 : 2;
    const tokenCount = Math.round(config.avgTokens * tokenMultiplier * (0.7 + rand() * 0.6));

    // Cost varies by tokens
    const estimatedCost = parseFloat(
      (config.costPerPrompt * tokenMultiplier * (0.8 + rand() * 0.4)).toFixed(4)
    );

    events.push({
      id: `evt-${(eventId++).toString().padStart(6, "0")}`,
      timestamp: timestamp.toISOString(),
      product,
      activityType: activity,
      group: member.group,
      userId: member.group.member,
      promptPreview,
      originalPrompt,
      complexityScore,
      estimatedCost,
      hasPII,
      piiTypes,
      tokenCount,
    });

    // Extra events during spike weeks
    if (isSpikeWeek && rand() < 0.3) {
      i--; // generate extra event
    }
  }

  // Sort by timestamp
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return events;
}

// ── Pre-generated singleton ────────────────────────────────────────────
let _cachedData: AIEvent[] | null = null;

export function getTestData(): AIEvent[] {
  if (!_cachedData) {
    _cachedData = generateTestData();
  }
  return _cachedData;
}

export function addEvent(event: AIEvent): void {
  const data = getTestData();
  data.push(event);
}

export function getProducts(): Product[] {
  return ["ChatGPT", "GitHub Copilot", "Claude", "Midjourney", "Gemini", "Cursor"];
}

export function getProductColor(product: Product): string {
  const colors: Record<Product, string> = {
    ChatGPT: "#10B981",
    "GitHub Copilot": "#6366F1",
    Claude: "#F59E0B",
    Midjourney: "#EC4899",
    Gemini: "#3B82F6",
    Cursor: "#8B5CF6",
  };
  return colors[product];
}

export function getActivityColor(activity: ActivityType): string {
  const colors: Record<ActivityType, string> = {
    "Code Generation": "#6366F1",
    "Code Review": "#8B5CF6",
    Debugging: "#A855F7",
    Writing: "#10B981",
    Editing: "#34D399",
    Research: "#3B82F6",
    Brainstorming: "#60A5FA",
    "Data Analysis": "#F59E0B",
    Summarization: "#FBBF24",
    "Image Generation": "#EC4899",
    Design: "#F472B6",
    Translation: "#14B8A6",
    Refactoring: "#7C3AED",
    Documentation: "#A78BFA",
  };
  return colors[activity];
}
