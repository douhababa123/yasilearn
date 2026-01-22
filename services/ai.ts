
import OpenAI from "openai";
import { AI_CONFIG } from "./config";

// --- Types Definitions ---

export interface FeedbackItem {
  type: 'Grammar' | 'Vocabulary' | 'Coherence' | 'Task Response';
  color: 'red' | 'purple' | 'orange' | 'blue';
  originalText: string;
  correctedText: string;
  explanation: string;         
  chineseExplanation: string;  
  improvementTip: string;      
}

export interface ScoreBreakdown {
  taskResponse: number;
  lexicalResource: number;
  coherenceCohesion: number;
  grammar: number;
}

export interface AssessmentResult {
  overallScore: number;
  breakdown: ScoreBreakdown;
  feedback: FeedbackItem[];
  generalComment: string;
  improvedEssay: string; 
  wordCount: number;
}

export interface VocabItem {
  word: string;
  phonetic: string;
  definition: string;
  imageUrl?: string; 
  examples: { en: string; cn: string }[];
  tags: string[];
  difficulty: number; 
}

// --- OpenAI Client Initialization ---

// Initialize using the centralized configuration
const openai = new OpenAI({
  apiKey: AI_CONFIG.apiKey, 
  baseURL: AI_CONFIG.baseURL,
  dangerouslyAllowBrowser: true 
});

// Helper: Clean Markdown from JSON response
const cleanJson = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

// --- Service Functions ---

export const evaluateEssay = async (essayText: string, topic: string): Promise<AssessmentResult> => {
  if (!AI_CONFIG.apiKey) throw new Error("API Key is missing. Please check .env file.");

  // VISUAL VERIFICATION: Log the model being used
  console.log(`🚀 AI Starting: Evaluating essay using model [${AI_CONFIG.modelName}]`);

  try {
    const prompt = `
      Act as a strict, senior IELTS Writing Examiner (Band 9.0 level).
      
      Topic: "${topic}"
      Essay: "${essayText}"
      
      Task:
      1. **Evaluate**: Provide strict scoring based on official public band descriptors.
      2. **Feedback**: Identify critical errors affecting the score. Explain WHY strictly.
      3. **Rewrite**: Provide a "Band 9.0 Model Answer" based on the user's original ideas but with native-level coherence and vocabulary.
      
      **CRITICAL**: You must return ONLY valid JSON.
      
      JSON Schema:
      {
        "overallScore": number,
        "breakdown": {
          "taskResponse": number,
          "lexicalResource": number,
          "coherenceCohesion": number,
          "grammar": number
        },
        "generalComment": "string (English summary of performance)",
        "improvedEssay": "string (The Band 9 rewritten version)",
        "feedback": [
          {
            "type": "Grammar" | "Vocabulary" | "Coherence" | "Task Response",
            "color": "red" | "purple" | "orange" | "blue",
            "originalText": "string",
            "correctedText": "string",
            "explanation": "string (English reason)",
            "chineseExplanation": "string (Chinese translation of the reason)",
            "improvementTip": "string (Actionable advice)"
          }
        ]
      }
    `;

    // Using configured model (qwen3-max by default)
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.modelName, 
      messages: [
        { role: "system", content: "You are an expert IELTS examiner system. You output valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: AI_CONFIG.temperature, 
      response_format: { type: "json_object" } 
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Empty response from Qwen");

    console.log("✅ AI Response received successfully.");

    const result = JSON.parse(cleanJson(content)) as AssessmentResult;
    result.wordCount = essayText.split(/\s+/).filter(w => w.length > 0).length;
    return result;

  } catch (error) {
    console.error(`❌ AI Evaluation Failed (${AI_CONFIG.modelName}):`, error);
    throw error;
  }
};

export const parseVocabularyData = async (rawInput: string): Promise<VocabItem[]> => {
  if (!AI_CONFIG.apiKey) throw new Error("API Key is missing. Please check .env file.");

  // VISUAL VERIFICATION: Log the model being used
  console.log(`🚀 AI Starting: Parsing vocabulary using model [${AI_CONFIG.modelName}]`);

  try {
    const prompt = `
      You are an expert Data Engineer. Extract structured vocabulary data from the raw input below.
      
      Input:
      """
      ${rawInput}
      """
      
      Tasks:
      1. Identify words. Fix spelling.
      2. Generate IPA phonetic, Chinese definition, and one IELTS-level example sentence (en/cn).
      3. **Images**: Extract 'imageUrl' from Markdown (![alt](url)) or HTML (<img src='url'>). If none, null.
      4. Return ONLY valid JSON Array.
      
      JSON Schema per item:
      {
        "word": "string",
        "phonetic": "string",
        "definition": "string",
        "imageUrl": "string | null",
        "examples": [{"en": "string", "cn": "string"}],
        "tags": ["string"],
        "difficulty": number (1-5)
      }
    `;

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.modelName,
      messages: [
        { role: "system", content: "You are a data extraction engine. Output JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1, // Low temp for data extraction reliability
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Empty response from Qwen");
    
    console.log("✅ AI Response received successfully.");

    return JSON.parse(cleanJson(content)) as VocabItem[];

  } catch (error) {
    console.error(`❌ Vocab Parsing Failed (${AI_CONFIG.modelName}):`, error);
    throw error;
  }
}
