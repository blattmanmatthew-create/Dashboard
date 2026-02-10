// Simple PII detection and anonymization for demo purposes

interface AnonymizationResult {
  anonymized: string;
  hasPII: boolean;
  piiTypes: string[];
  highlights: { start: number; end: number; type: string; original: string }[];
}

const PII_PATTERNS: { pattern: RegExp; type: string; replacement: string }[] = [
  {
    pattern: /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g,
    type: "Person Name",
    replacement: "[PERSON]",
  },
  {
    pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    type: "Email Address",
    replacement: "[EMAIL]",
  },
  {
    pattern: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
    type: "SSN",
    replacement: "[SSN]",
  },
  {
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    type: "Credit Card",
    replacement: "[CREDIT_CARD]",
  },
  {
    pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    type: "Phone Number",
    replacement: "[PHONE]",
  },
  {
    pattern: /\b\d{1,5}\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s(?:St|Ave|Blvd|Dr|Ln|Rd|Way|Ct)\b/g,
    type: "Address",
    replacement: "[ADDRESS]",
  },
  {
    pattern: /\b(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12]\d|3[01])\/(?:19|20)\d{2}\b/g,
    type: "Date of Birth",
    replacement: "[DOB]",
  },
];

export function anonymizePrompt(text: string): AnonymizationResult {
  let anonymized = text;
  const piiTypes: string[] = [];
  const highlights: AnonymizationResult["highlights"] = [];

  for (const { pattern, type, replacement } of PII_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (!piiTypes.includes(type)) {
        piiTypes.push(type);
      }
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        type,
        original: match[0],
      });
    }

    anonymized = anonymized.replace(new RegExp(pattern.source, pattern.flags), replacement);
  }

  return {
    anonymized,
    hasPII: piiTypes.length > 0,
    piiTypes,
    highlights,
  };
}

export function classifyActivity(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (/\b(write|create|generate|build|implement)\b.*\b(code|function|class|component|api|endpoint)\b/.test(lower))
    return "Code Generation";
  if (/\b(review|check|analyze)\b.*\b(code|pr|pull request)\b/.test(lower)) return "Code Review";
  if (/\b(debug|fix|resolve|trace)\b.*\b(error|bug|issue)\b/.test(lower)) return "Debugging";
  if (/\b(refactor|simplify|modernize|optimize)\b/.test(lower)) return "Refactoring";
  if (/\b(document|readme|jsdoc|api doc)\b/.test(lower)) return "Documentation";
  if (/\b(image|illustration|banner|visual|photo)\b/.test(lower)) return "Image Generation";
  if (/\b(design|mockup|icon|layout|wireframe)\b/.test(lower)) return "Design";
  if (/\b(translate|localize|convert)\b.*\b(language|market|region)\b/.test(lower)) return "Translation";
  if (/\b(summarize|summary|tldr|condense|key points)\b/.test(lower)) return "Summarization";
  if (/\b(analyze|analysis|calculate|model|predict|data)\b/.test(lower)) return "Data Analysis";
  if (/\b(research|compare|find|trends|best practices)\b/.test(lower)) return "Research";
  if (/\b(brainstorm|ideas|creative|suggest|explore options)\b/.test(lower)) return "Brainstorming";
  if (/\b(edit|proofread|revise|improve|clarity)\b/.test(lower)) return "Editing";
  if (/\b(write|draft|compose|create)\b/.test(lower)) return "Writing";

  return "Research";
}
