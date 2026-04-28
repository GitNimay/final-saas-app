export type RequestBudgetKey =
  | 'validation'
  | 'deepAnalysis'
  | 'actionPlan'
  | 'blueprint'
  | 'roadmap'
  | 'techStack'
  | 'prd'
  | 'builder'
  | 'consultant'
  | 'enhance'
  | 'default'
  | string;

export interface HistoryMessage {
  role: string;
  content: string;
}

export interface RequestBudget {
  maxInputChars: number;
  maxOutputTokens: number;
  maxHistoryMessages: number;
  maxHistoryMessageChars: number;
  temperature: number;
}

const TRUNCATION_SUFFIX = '...';

const BUDGETS: Record<string, RequestBudget> = {
  validation: {
    maxInputChars: 1800,
    maxOutputTokens: 2000,
    maxHistoryMessages: 0,
    maxHistoryMessageChars: 0,
    temperature: 0.35,
  },
  deepAnalysis: {
    maxInputChars: 1800,
    maxOutputTokens: 3000,
    maxHistoryMessages: 0,
    maxHistoryMessageChars: 0,
    temperature: 0.35,
  },
  actionPlan: {
    maxInputChars: 1800,
    maxOutputTokens: 3000,
    maxHistoryMessages: 0,
    maxHistoryMessageChars: 0,
    temperature: 0.3,
  },
  blueprint: {
    maxInputChars: 1800,
    maxOutputTokens: 3200,
    maxHistoryMessages: 0,
    maxHistoryMessageChars: 0,
    temperature: 0.25,
  },
  roadmap: {
    maxInputChars: 1800,
    maxOutputTokens: 1200,
    maxHistoryMessages: 0,
    maxHistoryMessageChars: 0,
    temperature: 0.3,
  },
  techStack: {
    maxInputChars: 1800,
    maxOutputTokens: 2200,
    maxHistoryMessages: 0,
    maxHistoryMessageChars: 0,
    temperature: 0.3,
  },
  prd: {
    maxInputChars: 1800,
    maxOutputTokens: 2500,
    maxHistoryMessages: 0,
    maxHistoryMessageChars: 0,
    temperature: 0.35,
  },
  builder: {
    maxInputChars: 2400,
    maxOutputTokens: 2500,
    maxHistoryMessages: 0,
    maxHistoryMessageChars: 0,
    temperature: 0.35,
  },
  consultant: {
    maxInputChars: 1200,
    maxOutputTokens: 700,
    maxHistoryMessages: 8,
    maxHistoryMessageChars: 700,
    temperature: 0.35,
  },
  enhance: {
    maxInputChars: 700,
    maxOutputTokens: 120,
    maxHistoryMessages: 0,
    maxHistoryMessageChars: 0,
    temperature: 0.45,
  },
  default: {
    maxInputChars: 1800,
    maxOutputTokens: 1600,
    maxHistoryMessages: 4,
    maxHistoryMessageChars: 600,
    temperature: 0.35,
  },
};

export const getRequestBudget = (key: RequestBudgetKey = 'default'): RequestBudget => {
  return BUDGETS[key] || BUDGETS.default;
};

export const compactText = (value: string, maxChars: number): string => {
  const normalized = value.replace(/\s+/g, ' ').trim();

  if (maxChars <= 0 || normalized.length <= maxChars) {
    return normalized;
  }

  if (maxChars <= TRUNCATION_SUFFIX.length) {
    return normalized.slice(0, maxChars);
  }

  return `${normalized.slice(0, maxChars - TRUNCATION_SUFFIX.length).trimEnd()}${TRUNCATION_SUFFIX}`;
};

export const limitHistoryForCost = (
  history: HistoryMessage[] = [],
  options: { maxMessages: number; maxCharsPerMessage: number },
): HistoryMessage[] => {
  if (options.maxMessages <= 0 || options.maxCharsPerMessage <= 0) {
    return [];
  }

  return history
    .filter((message) => message.content?.trim())
    .slice(-options.maxMessages)
    .map((message) => ({
      role: message.role,
      content: compactText(message.content, options.maxCharsPerMessage),
    }));
};

export const buildCostAwareSystemInstruction = (
  baseInstruction = '',
  useJsonResponse = false,
): string => {
  const guidance = useJsonResponse
    ? 'Return compact JSON only. Do not add unused fields, commentary, markdown fences, or duplicate ideas.'
    : 'Answer concisely with the minimum detail needed to complete the task. Avoid filler, repeated caveats, and duplicate ideas.';

  return [baseInstruction.trim(), guidance].filter(Boolean).join('\n');
};

export const supportsDisabledThinking = (modelId: string): boolean => {
  return /gemini-2\.5-flash/i.test(modelId);
};
