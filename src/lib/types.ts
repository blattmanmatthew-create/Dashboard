export interface AIEvent {
  id: string;
  timestamp: string;
  product: Product;
  activityType: ActivityType;
  group: GroupHierarchy;
  userId: string; // anonymized
  promptPreview: string; // anonymized
  originalPrompt?: string; // only for PII-flagged
  complexityScore: "Simple" | "Moderate" | "Complex";
  estimatedCost: number;
  hasPII: boolean;
  piiTypes?: string[];
  tokenCount: number;
}

export type Product =
  | "ChatGPT"
  | "GitHub Copilot"
  | "Claude"
  | "Midjourney"
  | "Gemini"
  | "Cursor";

export type ActivityType =
  | "Code Generation"
  | "Code Review"
  | "Debugging"
  | "Writing"
  | "Editing"
  | "Research"
  | "Brainstorming"
  | "Data Analysis"
  | "Summarization"
  | "Image Generation"
  | "Design"
  | "Translation"
  | "Refactoring"
  | "Documentation";

export interface GroupHierarchy {
  organization: string;
  division: string;
  department: string;
  team: string;
  member: string; // anonymized ID
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type TabType = "dashboard" | "data-input" | "pii-review";
