
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BlueprintData, KanbanBoard, TechStackData, ValidationData, DeepAnalysisData, ActionPlanData } from "../types";
import { INITIAL_KANBAN_COLUMNS, INITIAL_COLUMN_ORDER } from "../constants";
import {
  buildCostAwareSystemInstruction,
  compactText,
  getRequestBudget,
  limitHistoryForCost,
  RequestBudgetKey,
  supportsDisabledThinking,
} from "./tokenBudget";
import {
  normalizeActionPlanData,
  normalizeBlueprintData,
  normalizeDeepAnalysisData,
  normalizeRoadmapTasks,
  normalizeTechStackData,
  normalizeValidationData,
} from "./generatedData";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface ModelConfig {
  id: string;
  name: string;
  active: boolean;
  provider: 'gemini' | 'groq';
}

const cleanJson = (text: string) => {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
};

const cleanMarkdown = (text: string) => {
  return text.replace(/```markdown\n?/g, '').replace(/```\n?/g, '').trim();
}

const convertSchemaToJsonSchema = (schema: Schema): any => {
  const convertType = (type: any): string => {
    if (type === Type.STRING) return 'string';
    if (type === Type.NUMBER) return 'number';
    if (type === Type.INTEGER) return 'integer';
    if (type === Type.BOOLEAN) return 'boolean';
    if (type === Type.ARRAY) return 'array';
    if (type === Type.OBJECT) return 'object';
    return 'string';
  };

  const convert = (s: any): any => {
    if (!s) return undefined;
    if (typeof s === 'string') return convertType(s);
    if (Array.isArray(s)) return s.map(convert);
    if (typeof s === 'object') {
      const result: any = {};
      if (s.type) result.type = convertType(s.type);
      if (s.properties) {
        result.properties = {};
        for (const key in s.properties) {
          result.properties[key] = convert(s.properties[key]);
        }
      }
      if (s.items) result.items = convert(s.items);
      if (s.description) result.description = s.description;
      if (s.enum) result.enum = s.enum;
      if (s.required) result.required = s.required;
      return result;
    }
    return s;
  };

  return convert(schema);
};

const callAIModel = async (
  modelConfig: ModelConfig,
  contents: string,
  options: {
    systemInstruction?: string;
    schema?: Schema;
    useJsonResponse?: boolean;
    history?: { role: string; content: string }[];
    budget?: RequestBudgetKey;
  } = {}
): Promise<string> => {
  console.log('callAIModel:', modelConfig.id, modelConfig.provider);
  
  const { systemInstruction, schema, useJsonResponse = false, history, budget = 'default' } = options;
  const requestBudget = getRequestBudget(budget);
  const compactContents = compactText(contents, requestBudget.maxInputChars);
  const compactSystemInstruction = systemInstruction
    ? compactText(systemInstruction, requestBudget.maxInputChars)
    : '';
  const finalSystemInstruction = buildCostAwareSystemInstruction(compactSystemInstruction, useJsonResponse);
  const limitedHistory = limitHistoryForCost(history, {
    maxMessages: requestBudget.maxHistoryMessages,
    maxCharsPerMessage: requestBudget.maxHistoryMessageChars,
  });

  if (modelConfig.provider === 'gemini') {
    const model = modelConfig.id;
    const config: any = {
      maxOutputTokens: requestBudget.maxOutputTokens,
      temperature: requestBudget.temperature,
    };
    
    if (useJsonResponse && schema) {
      config.responseMimeType = "application/json";
      config.responseSchema = schema;
    }
    if (finalSystemInstruction) {
      config.systemInstruction = finalSystemInstruction;
    }
    if (supportsDisabledThinking(model)) {
      config.thinkingConfig = { thinkingBudget: 0, includeThoughts: false };
    }

    if (limitedHistory.length > 0) {
      const chat = ai.chats.create({
        model,
        config,
        history: limitedHistory.map((message) => ({
          role: message.role === 'assistant' || message.role === 'model' ? 'model' : 'user',
          parts: [{ text: message.content }],
        })) as any
      });
      const result = await chat.sendMessage({ message: compactContents });
      return result.text;
    } else {
      const response = await ai.models.generateContent({
        model,
        contents: compactContents,
        config
      });
      return response.text;
    }
  }

  const apiKey = process.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(`API key not configured for Groq`);
  }

  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  const messages: any[] = [];
  
  let groqSystemInstruction = finalSystemInstruction;
  
  if (useJsonResponse && schema) {
    const jsonSchema = convertSchemaToJsonSchema(schema);
    groqSystemInstruction += `\nJSON schema: ${JSON.stringify(jsonSchema)}`;
  }

  if (groqSystemInstruction) {
    messages.push({ role: 'system', content: groqSystemInstruction });
  }

  if (limitedHistory.length > 0) {
    messages.push(...limitedHistory.map((message) => ({
      role: message.role === 'assistant' || message.role === 'model' ? 'assistant' : 'user',
      content: message.content,
    })));
  }

  messages.push({ role: 'user', content: compactContents });

  const requestBody: any = {
    model: modelConfig.id,
    messages,
    temperature: requestBudget.temperature,
    max_tokens: requestBudget.maxOutputTokens,
  };

  if (useJsonResponse) {
    requestBody.response_format = { type: 'json_object' };
  }

  console.log('Making request to:', endpoint, 'with model:', modelConfig.id);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`API call failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0]) {
    console.error('Invalid response:', data);
    throw new Error('Invalid API response');
  }
  
  return data.choices[0].message.content;
};

const validationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    projectTitle: { type: Type.STRING, description: "A short, catchy, professional name for this project idea (max 3-5 words)." },
    viabilityScore: { type: Type.NUMBER, description: "Score 0-100" },
    summary: { type: Type.STRING, description: "A concise, punchy 2-sentence strategic verdict on why this is viable or risky." },
    radarData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          A: { type: Type.NUMBER, description: "Score out of 100" },
          fullMark: { type: Type.NUMBER, description: "Always 100" }
        }
      }
    },
    revenueData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.STRING },
          revenue: { type: Type.NUMBER },
          expenses: { type: Type.NUMBER }
        }
      }
    },
    marketStats: {
      type: Type.OBJECT,
      properties: {
        tam: { type: Type.NUMBER, description: "Total Addressable Market in Millions (Number only)" },
        sam: { type: Type.NUMBER, description: "Serviceable Addressable Market in Millions (Number only)" },
        som: { type: Type.NUMBER, description: "Serviceable Obtainable Market in Millions (Number only)" }
      }
    },
    swot: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    competitors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          price: { type: Type.STRING },
          gap: { type: Type.STRING, description: "Short 2-3 word differentiator (e.g. 'No Mobile App')" }
        }
      }
    }
  },
  required: ["projectTitle", "viabilityScore", "summary", "radarData", "revenueData", "marketStats", "swot", "competitors"]
};

const blueprintSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    diagrams: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING, description: "One of 'system', 'database', 'flow'" },
          description: { type: Type.STRING },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                type: { type: Type.STRING, description: "For system: 'service', 'db', 'client'. For DB: 'table'. For Flow: 'step'." },
                attributes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "For DB: list columns (e.g. 'id PK uuid'). For System: list tech/features." },
                x: { type: Type.NUMBER, description: "X coordinate (0-1000)" },
                y: { type: Type.NUMBER, description: "Y coordinate (0-800)" }
              }
            }
          },
          edges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                label: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  },
  required: ["diagrams"]
};

const kanbanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          column: { type: Type.STRING, description: "Must be 'Backlog', 'To Do', 'In Progress', 'Review', 'Done'" },
          tag: { type: Type.STRING, description: "Frontend, Backend, Design, or Marketing" }
        }
      }
    }
  }
};

const techStackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    technologies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          icon: { type: Type.STRING, description: "e.g. 'react', 'nextjs', 'vue', 'python', 'node', 'figma', 'flutter'" },
          docs: { type: Type.STRING, description: "Official documentation URL" },
          description: { type: Type.STRING, description: "Short rationale for choosing this." },
          color: { type: Type.STRING, description: "Hex code matching the brand (e.g. React #61DAFB)" }
        }
      }
    },
    auditReport: { type: Type.STRING, description: "Markdown audit of the stack" },
    diagram: {
      type: Type.OBJECT,
      properties: {
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              type: { type: Type.STRING, description: "'frontend', 'backend', 'db', 'tool'" }
            }
          }
        },
        edges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              source: { type: Type.STRING },
              target: { type: Type.STRING }
            }
          }
        }
      }
    }
  }
};

const deepAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    marketDemand: {
      type: Type.OBJECT,
      properties: {
        trendData: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              month: { type: Type.STRING },
              searchVolume: { type: Type.NUMBER },
              interest: { type: Type.NUMBER }
            }
          }
        },
        keywords: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              value: { type: Type.NUMBER, description: "Relative size/volume (1-100)" }
            }
          }
        },
        audienceSegments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              segment: { type: Type.STRING },
              size: { type: Type.STRING },
              painPoint: { type: Type.STRING }
            }
          }
        }
      }
    },
    competitorAnalysis: {
      type: Type.OBJECT,
      properties: {
        featureMatrix: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              feature: { type: Type.STRING },
              us: { type: Type.BOOLEAN },
              competitorA: { type: Type.BOOLEAN },
              competitorB: { type: Type.BOOLEAN }
            }
          }
        },
        competitorNames: {
          type: Type.OBJECT,
          properties: {
            A: { type: Type.STRING },
            B: { type: Type.STRING }
          }
        }
      }
    },
    feasibility: {
      type: Type.OBJECT,
      properties: {
        technicalDifficulty: { type: Type.NUMBER, description: "0-100" },
        devTimeMonths: { type: Type.NUMBER },
        infraCost: { type: Type.NUMBER, description: "Monthly estimated cost in USD" },
        costBreakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              cost: { type: Type.NUMBER }
            }
          }
        },
        risks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              risk: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              mitigation: { type: Type.STRING }
            }
          }
        }
      }
    },
    monetization: {
      type: Type.OBJECT,
      properties: {
        strategy: { type: Type.STRING },
        tiers: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              price: { type: Type.STRING },
              features: { type: Type.ARRAY, items: { type: Type.STRING } },
              highlight: { type: Type.BOOLEAN }
            }
          }
        },
        projectedMRR: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              month: { type: Type.STRING },
              amount: { type: Type.NUMBER }
            }
          }
        }
      }
    }
  },
  required: ["marketDemand", "competitorAnalysis", "feasibility", "monetization"]
};

const actionPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: "Phase name like 'Validation Week', 'MVP Building', 'Beta Launch', 'First Customers'" },
          description: { type: Type.STRING, description: "Brief description of phase goals" },
          startDay: { type: Type.NUMBER },
          endDay: { type: Type.NUMBER },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER, description: "Day number 1-30" },
                title: { type: Type.STRING, description: "Short task title" },
                description: { type: Type.STRING, description: "1-2 sentence description" },
                estimatedTime: { type: Type.STRING, description: "Time estimate like '2 hours', '45 mins', '3 hours'" },
                category: { type: Type.STRING, description: "One of: Research, Development, Marketing, Design, Testing, Launch" }
              }
            }
          }
        }
      }
    },
    totalTasks: { type: Type.NUMBER },
    estimatedTotalHours: { type: Type.NUMBER }
  },
  required: ["phases", "totalTasks", "estimatedTotalHours"]
};

export const generateValidation = async (idea: string, modelConfig: ModelConfig): Promise<ValidationData> => {
  console.log('generateValidation called');
  const contents = `Analyze this SaaS idea: "${idea}". Provide a comprehensive business validation report.
  1. Project Title: Short, catchy name.
  2. Viability Score: 0-100 (Be realistic).
  3. Summary: A short, punchy 2-sentence strategic verdict.
  4. Market Stats: TAM, SAM, SOM (Just numbers in Millions).
  5. Revenue Data: 5-year projection array with 'revenue' and 'expenses'.
  6. Radar Data: 6 key metrics with scores 0-100.
  7. SWOT: Short bullet points (max 4 per category).
  8. Competitors: List 4 specific competitors.`;
  
  const response = await callAIModel(modelConfig, contents, {
    schema: validationSchema,
    useJsonResponse: true,
    budget: 'validation'
  });
  
  return normalizeValidationData(JSON.parse(cleanJson(response)));
};

export const generateDeepAnalysis = async (idea: string, modelConfig: ModelConfig): Promise<DeepAnalysisData> => {
  const contents = `Provide a DEEP-DIVE analysis for the SaaS idea: "${idea}".
  1. Market Demand: Simulated trend data (12 months), keyword volume, and audience segments.
  2. Competitor Feature Matrix: Comparison table against 2 competitors.
  3. Technical Feasibility: Dev time estimates, monthly cloud cost breakdown, and risks.
  4. Monetization: Pricing tiers (Free, Pro, Business) and projected MRR growth for first 6 months.`;
  
  const response = await callAIModel(modelConfig, contents, {
    schema: deepAnalysisSchema,
    useJsonResponse: true,
    budget: 'deepAnalysis'
  });
  
  return normalizeDeepAnalysisData(JSON.parse(cleanJson(response)));
};

export const generateActionPlan = async (idea: string, modelConfig: ModelConfig): Promise<ActionPlanData> => {
  const contents = `Create a detailed 30-DAY ACTION PLAN for: "${idea}".
  4 phases: Validation Week (1-7), MVP Building (8-14), Beta Launch (15-21), First Customers (22-30).
  Each day: 1-2 specific tasks with time estimates. Categories: Research, Development, Marketing, Design, Testing, Launch.`;
  
  const response = await callAIModel(modelConfig, contents, {
    schema: actionPlanSchema,
    useJsonResponse: true,
    budget: 'actionPlan'
  });
  
  return normalizeActionPlanData(JSON.parse(cleanJson(response)));
};

export const generateBlueprint = async (idea: string, modelConfig: ModelConfig): Promise<BlueprintData> => {
  const contents = `Create 3 technical architecture diagrams for: "${idea}".
  1. System Architecture: Client -> Gateway -> Services -> DB (8-10 nodes).
  2. Database Schema: ERD style, 6-8 tables with columns.
  3. User Flow: Sequence diagram, 6-8 steps.`;
  
  const response = await callAIModel(modelConfig, contents, {
    schema: blueprintSchema,
    useJsonResponse: true,
    budget: 'blueprint'
  });

  return normalizeBlueprintData(JSON.parse(cleanJson(response)));
};

export const generateRoadmap = async (idea: string, modelConfig: ModelConfig): Promise<KanbanBoard> => {
  const contents = `Create a project roadmap for "${idea}". Generate 10-15 tasks across Backlog, To Do, and In Progress.`;
  
  const response = await callAIModel(modelConfig, contents, {
    schema: kanbanSchema,
    useJsonResponse: true,
    budget: 'roadmap'
  });

  const tasks = normalizeRoadmapTasks(JSON.parse(cleanJson(response)));
  const board = JSON.parse(JSON.stringify(INITIAL_KANBAN_COLUMNS));

  tasks.forEach((task: any, index: number) => {
    const colMap: Record<string, string> = {
      'Backlog': 'column-1',
      'To Do': 'column-2',
      'In Progress': 'column-3',
      'Review': 'column-4',
      'Done': 'column-5'
    };
    const colId = colMap[task.column] || 'column-1';
    board[colId].items.push({
      id: `task-${index}-${Date.now()}`,
      content: task.title,
      tag: task.tag
    });
  });

  return { columns: board, columnOrder: INITIAL_COLUMN_ORDER };
};

export const generateTechStack = async (idea: string, modelConfig: ModelConfig): Promise<TechStackData> => {
  const contents = `Recommend a modern tech stack for "${idea}". Return 8-12 technologies with name, category, docs URL, description, and hex color.`;
  
  const response = await callAIModel(modelConfig, contents, {
    schema: techStackSchema,
    useJsonResponse: true,
    budget: 'techStack'
  });
  
  return normalizeTechStackData(JSON.parse(cleanJson(response)));
};

export const generatePRD = async (idea: string, modelConfig: ModelConfig): Promise<string> => {
  const contents = `Write a professional PRD for: "${idea}". Format: Markdown. Sections: Executive Summary, Problem Statement, Target Audience, Functional Requirements, Non-Functional Requirements, UX/UI Guidelines, Future Scope.`;
  
  const response = await callAIModel(modelConfig, contents, { budget: 'prd' });
  return cleanMarkdown(response);
};

export const generateBuilderPrompt = async (idea: string, quizAnswers: Record<string, string>, modelConfig: ModelConfig): Promise<string> => {
  const contents = `Create a "Mega-Prompt" for AI Coding Assistant to build: "${idea}". Tech: ${JSON.stringify(quizAnswers)}. Structure: Role, Tech Stack, Project Structure, Implementation Plan, Coding Standards.`;

  const response = await callAIModel(modelConfig, contents, { budget: 'builder' });
  return cleanMarkdown(response);
};

export const generateConsultantReply = async (
  projectContext: string, 
  history: { role: string, parts: { text: string }[] }[], 
  message: string,
  modelConfig: ModelConfig
) => {
  const systemInstruction = `You are an expert SaaS Consultant. Context: ${projectContext}. Be concise, insightful, strategic.`;

  const openAiHistory = history.map(h => ({
    role: h.role === 'model' ? 'assistant' : h.role,
    content: h.parts[0]?.text || ''
  }));

  const response = await callAIModel(modelConfig, message, { 
    systemInstruction,
    history: openAiHistory,
    budget: 'consultant'
  });
  
  return response;
};

export const enhancePrompt = async (currentInput: string, modelConfig: ModelConfig): Promise<string> => {
  const contents = `Enhance this SaaS idea: "${currentInput}". Keep under 3 sentences. Make it sound like a solid elevator pitch.`;
  
  const response = await callAIModel(modelConfig, contents, { budget: 'enhance' });
  return response.trim();
};
