import { Groq } from "groq-sdk";
import OpenAI from "openai";
import { Mode, MODE_CONFIG } from "./openai";
import { safeParseLLMResponse } from "./json";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export type LLMProviderUsed = "groq" | "openai" | "ollama";

export interface LLMResponse {
  topic_title: string;
  provider?: LLMProviderUsed;
  model?: string;
  nodes: {
    id: string;
    title: string;
    depth: number;
    parentId: string | null;
    order: number;
    content: {
      summary: string;
      key_points: string[];
      examples: string[];
      misconceptions?: string[];
      faq?: { question: string; answer: string }[];
      next_concepts?: string[];
      image_prompt?: string;
      visual_flowchart?: { step: string; description: string }[];
      visual_grid?: { title: string; description: string; image_prompt: string }[];
      interactive_quiz?: { question: string; options: string[]; answer_index: number; explanation: string }[];
    };
  }[];
  flowchart?: { from: string; to: string; label?: string }[];
}

async function callOllama(system: string, user: string): Promise<any> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3";

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Ollama Error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return safeParseLLMResponse(data.message.content);
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED' || err.message.includes('fetch failed')) {
      throw new Error("Local AI engine (Ollama) is not running. Please start Ollama or check your Groq API key.");
    }
    console.error("Ollama Call Failed:", err);
    throw err;
  }
}

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
  "llama-3.1-8b-instant"
];

export async function generateTopic({ query, mode }: { query: string; mode: Mode }): Promise<LLMResponse> {
  const preferredProvider = (process.env.LLM_PROVIDER as LLMProviderUsed) || "groq";
  const config = MODE_CONFIG[mode];

  const systemPrompt = `You are an expert educator. 
  Generate a comprehensive structured outline for the topic: "${query}".
  Include a "Topic Title" and a list of "Nodes".
  Provide ONLY the skeleton structure for all nodes (id, title, depth, parentId, order). 
  Do NOT provide any "content" (summary, key_points, etc.) for any nodes. 
  
  JSON Structure:
  {
    "topic_title": "Descriptive title",
    "nodes": [
      { "id": "n1", "title": "Main Chapter", "depth": 0, "parentId": null, "order": 1 },
      { "id": "n2", "title": "Subtopic Title", "depth": 1, "parentId": "n1", "order": 2 }
    ]
  }

  Explanation Mode: ${mode}
  Target Node Count: ${config.nodeCount}`;

  const userPrompt = `Generate a structured outline for: "${query}".`;

  // Attempt Primary Providers (Groq/OpenAI)
  if (preferredProvider === "groq" && groq) {
    for (const model of GROQ_MODELS) {
      try {
        console.log(`[Cosmic Trace] Attempting Groq with model: ${model}`);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("LLM Provider Timeout")), 45000));
        const groqPromise = groq.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        });

        const response = await Promise.race([groqPromise, timeoutPromise]) as any;
        const result = safeParseLLMResponse(response.choices[0].message.content || "{}");
        return { ...result, provider: "groq", model: model };
      } catch (error: any) {
        console.warn(`Groq model ${model} failed:`, error.message);
        // If it's not a rate limit error, we might want to break, but usually safe to try next model
        if (error.message.includes("rate_limit_exceeded") || error.status === 429) {
          continue; // Try next model
        }
        // If we've tried all models and they all failed for other reasons, it will naturally fall through to Ollama
      }
    }
  }

  if (preferredProvider === "openai" && openai) {
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("LLM Provider Timeout")), 45000));
      const openaiPromise = openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      });
      const response = await Promise.race([openaiPromise, timeoutPromise]) as any;
      const result = safeParseLLMResponse(response.choices[0].message.content || "{}");
      return { ...result, provider: "openai", model: "gpt-4o-mini" };
    } catch (error: any) {
      console.warn(`OpenAI failed:`, error.message);
    }
  }

  // Fallback to Ollama
  try {
    console.log("[Cosmic Trace] Attempting Ollama fallback...");
    const result = await callOllama(systemPrompt, userPrompt);
    return { ...result, provider: "ollama", model: process.env.OLLAMA_MODEL || "llama3" };
  } catch (err: any) {
    if (err.message.includes("Ollama") || err.message.includes("fetch failed")) {
      throw new Error("Neural Engine (Groq) failed and no local engine (Ollama) was found. Please check your GROQ_API_KEY or start Ollama locally.");
    }
    throw err;
  }
}

export async function generateNodeContent({ query, nodeTitle, mode }: { query: string; nodeTitle: string; mode: Mode }) {
  const preferredProvider = (process.env.LLM_PROVIDER as LLMProviderUsed) || "groq";
  const config = MODE_CONFIG[mode];

  const systemPrompt = `You are an expert educator. Explain "${nodeTitle}" (Topic: "${query}").
    RETURN ONLY A VALID JSON OBJECT. NO MARKDOWN. NO BRACHETS AROUND JSON.
    
    Format:
    {
      "summary": "Full overview in ${config.summaryLines} lines",
      "key_points": ["point 1", "point 2"],
      "examples": ["example 1"],
      "image_prompt": "cinematic illustration description",
      "visual_flowchart": [{ "step": "...", "description": "..." }],
      "visual_grid": [{ "title": "...", "description": "...", "image_prompt": "..." }],
      "interactive_quiz": [{ "question": "...", "options": ["..."], "answer_index": 0, "explanation": "..." }]
    }`;

  const userPrompt = `Provide content for: "${nodeTitle}" (Topic: "${query}")`;

  if (preferredProvider === "groq" && groq) {
    for (const model of GROQ_MODELS) {
      try {
        console.log(`[Cosmic Trace] Node content primary attempt with model: ${model}`);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Neural Link Timeout after 60s")), 60000));
        const groqPromise = groq.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        });

        const response = await Promise.race([groqPromise, timeoutPromise]) as any;
        return { ...safeParseLLMResponse(response.choices[0].message.content || "{}"), provider: "groq", model: model };
      } catch (err: any) {
        console.warn(`[Cosmic Trace] Groq node model ${model} failed:`, err.message);
        if (err.message.includes("rate_limit_exceeded") || err.status === 429) {
          continue;
        }
      }
    }
  }

  if (preferredProvider === "openai" && openai) {
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Neural Link Timeout after 60s")), 60000));
      const openaiPromise = openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      });
      const response = await Promise.race([openaiPromise, timeoutPromise]) as any;
      return { ...safeParseLLMResponse(response.choices[0].message.content || "{}"), provider: "openai", model: "gpt-4o-mini" };
    } catch (err: any) {
      console.warn("[Cosmic Trace] OpenAI node content attempt failed:", err.message);
    }
  }

  try {
    const result = await callOllama(systemPrompt, userPrompt);
    return { ...result, provider: "ollama", model: process.env.OLLAMA_MODEL || "llama3" };
  } catch (err: any) {
    throw new Error("Neural synchronization failed. Verify GROQ_API_KEY status or start Ollama locally.");
  }
}

export async function expandNode({ query, nodeTitle, mode }: { query: string; nodeTitle: string; mode: Mode }): Promise<LLMResponse> {
  const preferredProvider = (process.env.LLM_PROVIDER as LLMProviderUsed) || "groq";
  const config = MODE_CONFIG[mode];
  const childCount = mode === "SHORT" ? 3 : mode === "BRIEF" ? 4 : 6;

  const systemPrompt = `You are exploring the concept: "${query}". 
  Generate ${childCount} even deeper granular sub-topics (child nodes) for "${nodeTitle}".
  Return a STRICT JSON response only. No markdown. No extra text.
  
  JSON Structure:
  {
    "nodes": [
      { 
        "id": "c1", 
        "title": "Subtopic Title", 
        "depth": 0, 
        "parentId": null, 
        "order": 1,
        "content": {
          "summary": "Detailed summary in ${config.summaryLines} lines",
          "key_points": ["point 1", "point 2"],
          "examples": ["example 1"],
          "misconceptions": ["..."],
          "faq": [{"question": "...", "answer": "..."}],
          "next_concepts": ["..."],
          "image_prompt": "A detailed descriptive prompt for a scientific/educational illustration",
          "visual_flowchart": [
            { "step": "Step 1", "description": "..." },
            { "step": "Step 2", "description": "..." }
          ]
        }
      }
    ]
  }`;

  const userPrompt = `Expand sub-topic: "${nodeTitle}" within topic: "${query}"`;

  if (preferredProvider === "groq" && groq) {
    for (const model of GROQ_MODELS) {
      try {
        console.log(`[Cosmic Trace] Expansion attempt with model: ${model}`);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("LLM Provider Timeout")), 45000));
        const groqPromise = groq.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        });

        const response = await Promise.race([groqPromise, timeoutPromise]) as any;
        const result = safeParseLLMResponse(response.choices[0].message.content || "{}");
        return { ...result, provider: "groq", model: model };
      } catch (error: any) {
        console.warn(`Groq model ${model} failed for expansion:`, error.message);
        if (error.message.includes("rate_limit_exceeded") || error.status === 429) {
          continue;
        }
      }
    }
  }

  if (preferredProvider === "openai" && openai) {
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("LLM Provider Timeout")), 45000));
      const openaiPromise = openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      });
      const response = await Promise.race([openaiPromise, timeoutPromise]) as any;
      const result = safeParseLLMResponse(response.choices[0].message.content || "{}");
      return { ...result, provider: "openai", model: "gpt-4o-mini" };
    } catch (error: any) {
      console.warn(`OpenAI failed for expansion:`, error.message);
    }
  }

  console.log("Expanding node using Ollama fallback...");
  const result = await callOllama(systemPrompt, userPrompt);
  return { ...result, provider: "ollama", model: process.env.OLLAMA_MODEL || "llama3" };
}
