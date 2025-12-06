
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BlueprintData, KanbanBoard, MindMapData, TechStackData, ValidationData, DeepAnalysisData } from "../types";
import { INITIAL_KANBAN_COLUMNS, INITIAL_COLUMN_ORDER } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to strip markdown code blocks if AI adds them
const cleanJson = (text: string) => {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
};

const cleanMarkdown = (text: string) => {
    return text.replace(/```markdown\n?/g, '').replace(/```\n?/g, '').trim();
}

// --------------------------------------------------------
// Validation Schema
// --------------------------------------------------------
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

// --------------------------------------------------------
// Blueprint Schema
// --------------------------------------------------------
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

// --------------------------------------------------------
// Kanban Schema
// --------------------------------------------------------
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

// --------------------------------------------------------
// Tech Stack Schema
// --------------------------------------------------------
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
      description: "A node-link graph showing how these technologies connect in the architecture.",
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

// --------------------------------------------------------
// Deep Analysis Schema
// --------------------------------------------------------
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


export const generateValidation = async (idea: string): Promise<ValidationData> => {
  const model = "gemini-2.5-flash";
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze this SaaS idea: "${idea}". Provide a comprehensive business validation report.
    
    Structure the response for a modern dashboard display:
    1. Project Title: Short, catchy name.
    2. Viability Score: 0-100 (Be realistic).
    3. Summary: A short, punchy 2-sentence strategic verdict on WHY it is viable or risky. No fluff.
    4. Market Stats: TAM, SAM, SOM (Just numbers in Millions).
    5. Revenue Data: 5-year projection array with 'revenue' and 'expenses' values (growing logically for SaaS).
    6. Radar Data: 6 key metrics (e.g., 'Market Demand', 'Tech Feasibility', 'Competition', 'Scalability', 'Legal', 'Moat') with scores 0-100.
    7. SWOT: Short bullet points (max 4 per category).
    8. Competitors: List 4 specific real or archetypal competitors. Pricing should be short (e.g. '$10/mo'). Gap should be 2-3 words (e.g. 'Poor UI', 'No API').
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: validationSchema,
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const generateDeepAnalysis = async (idea: string): Promise<DeepAnalysisData> => {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: `Provide a DEEP-DIVE analysis for the SaaS idea: "${idea}".
      
      I need 4 specific sections:
      1. Market Demand: Simulated trend data (12 months), keyword volume, and audience segments.
      2. Competitor Feature Matrix: Comparison table against 2 specific real or archetypal competitors.
      3. Technical Feasibility: Dev time estimates, monthly cloud cost breakdown (AWS/Vercel/Supabase), and risks.
      4. Monetization: Pricing tiers (Free, Pro, Business) and projected MRR growth for first 6 months.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: deepAnalysisSchema,
      }
    });
    return JSON.parse(cleanJson(response.text));
};

export const generateBlueprint = async (idea: string): Promise<BlueprintData> => {
  const model = "gemini-2.5-flash";
  const response = await ai.models.generateContent({
    model,
    contents: `Create 3 distinct technical architecture diagrams for: "${idea}".
    
    1. System Architecture: High-level microservices/cloud view (Client -> Gateway -> Services -> DB). Use at least 8-10 nodes.
       - Nodes should have 'attributes' listing key technologies (e.g. "React", "Node.js", "Redis").
    
    2. Database Schema: ERD style. Entities as nodes (Users, Subscriptions, etc). Show relationships. Use at least 6-8 nodes.
       - IMPORTANT: Use 'attributes' to list 3-5 key columns per table (e.g. "id: uuid", "email: varchar").

    3. User Flow: A sequence diagram style showing a core user journey step-by-step. Use at least 6-8 nodes.
       - Use 'attributes' to describe the action briefly.

    For all diagrams, assign logical X/Y coordinates to avoid overlap.
    For System: Left-to-Right flow.
    For Database: Cluster related tables.
    For User Flow: Top-to-Bottom or Left-to-Right.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: blueprintSchema,
    }
  });
  
  const raw: any = JSON.parse(cleanJson(response.text));
  
  const diagrams = raw.diagrams.map((d: any, i: number) => ({
      id: `diag-${i}`,
      title: d.title,
      type: d.type,
      description: d.description,
      edges: d.edges,
      nodes: d.nodes.map((n: any) => ({
          id: n.id,
          // We will determine the specialized node type in the frontend based on diagram type
          // but we store the raw data here.
          type: d.type === 'database' ? 'databaseNode' : d.type === 'flow' ? 'flowNode' : 'systemNode',
          position: { x: n.x, y: n.y },
          data: { label: n.label, iconType: n.type, attributes: n.attributes || [] }
      }))
  }));
  
  return { diagrams };
};

export const generateRoadmap = async (idea: string): Promise<KanbanBoard> => {
  const model = "gemini-2.5-flash";
  const response = await ai.models.generateContent({
    model,
    contents: `Create a project roadmap for "${idea}". Generate 10-15 tasks across Backlog, To Do, and In Progress.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: kanbanSchema,
    }
  });

  const raw: any = JSON.parse(cleanJson(response.text));
  const board = JSON.parse(JSON.stringify(INITIAL_KANBAN_COLUMNS)); // Deep copy const

  raw.tasks.forEach((task: any, index: number) => {
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

export const generateTechStack = async (idea: string): Promise<TechStackData> => {
  const model = "gemini-2.5-flash";
  const response = await ai.models.generateContent({
    model,
    contents: `Recommend a modern tech stack for "${idea}". 
    
    Return a list of 8-12 specific technologies including:
    - Frameworks (React, Vue, Next.js, Flutter)
    - Languages (TypeScript, Python)
    - Design Tools (Figma, Adobe XD)
    - Backend/DB (Node.js, PostgreSQL, Supabase)
    
    Also generate a "diagram" (nodes and edges) showing how these technologies connect in the architecture (e.g. React -> Node.js -> Postgres).
    Include correct documentation URLs.
    Include specific brand hex colors (e.g. React #61DAFB).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: techStackSchema,
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const generatePRD = async (idea: string): Promise<string> => {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: `Write a professional Product Requirements Document (PRD) for a SaaS idea: "${idea}".
      
      Output Format: Markdown.
      Structure:
      1. Executive Summary
      2. Problem Statement
      3. Target Audience (Personas)
      4. Functional Requirements (User Stories)
      5. Non-Functional Requirements (Security, Performance)
      6. UX/UI Guidelines
      7. Future Scope
  
      Do not wrap in JSON. Just return the Markdown string.`,
    });
    return cleanMarkdown(response.text);
};
  
export const generateBuilderPrompt = async (idea: string, quizAnswers: Record<string, string>): Promise<string> => {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are an expert AI Prompt Engineer. Create a "Mega-Prompt" that I can paste into an AI Coding Assistant (like Cursor, Windsurf, or GitHub Copilot Workspace) to build this entire application from scratch.
  
      Project Idea: "${idea}"
      
      Technical Constraints (User selected):
      - Frontend: ${quizAnswers['Frontend Framework']}
      - Backend: ${quizAnswers['Backend Strategy']}
      - Database: ${quizAnswers['Database']}
      - Authentication: ${quizAnswers['Authentication']}
      - Styling: ${quizAnswers['Styling Strategy']}
      - Deployment: ${quizAnswers['Deployment']}
  
      The output prompt should be structured as follows:
      1. **Role & Goal**: Tell the AI it is a Senior Fullstack Engineer building a production-ready app.
      2. **Tech Stack Enforced**: Strictly list the chosen technologies.
      3. **Project Structure**: Suggest a file structure appropriate for the framework.
      4. **Step-by-Step Implementation Plan**:
         - Setup (Init repo, install dependencies)
         - Database Setup (Schema, Connection)
         - Authentication Implementation
         - Core Features (List 3-4 core features typical for this idea)
         - UI Implementation
      5. **Coding Standards**: Rules for Typescript, Error Handling, Responsive Design.
  
      Return ONLY the prompt text, ready to copy.
    `;
  
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    return cleanMarkdown(response.text);
};

export const generateConsultantReply = async (projectContext: string, history: {role: string, parts: {text: string}[]}[], message: string) => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are an expert SaaS Consultant. 
            
            Current Project Context:
            ${projectContext}
            
            Role: Be concise, insightful, and strategic. Act as a co-founder. Use the project context to provide specific advice.`
        },
        history: history as any
    });

    const result = await chat.sendMessage({ message });
    return result.text;
}

export const enhancePrompt = async (currentInput: string): Promise<string> => {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: `Enhance this SaaS idea prompt to be more detailed, professional, and clear for a business validator AI. 
      Keep it under 3 sentences but make it sound like a solid elevator pitch.
      
      Input: "${currentInput}"
      
      Output ONLY the enhanced text.`,
    });
    return response.text.trim();
};
