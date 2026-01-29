
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

export interface WordInsight {
  wordAnalysis: {
    word: string;
    phonetic: string;
    pos: string;
    chineseMeaning: string;
    englishDefinition: string;
  };
  wordRoot: {
    root: string;
    meaning: string;
    englishMeaning: string;
    origin: string;
    englishOrigin: string;
    memoryStory: string;
    englishMemoryStory: string;
  };
  wordFormation: Array<{
    word: string;
    englishWord: string;
    pos: string;
    meaning: string;
    englishMeaning: string;
    example: string;
    englishExample: string;
  }>;
  synonyms: Array<{
    word: string;
    englishWord: string;
    meaning: string;
    englishMeaning: string;
    usage: string;
    englishUsage: string;
    difference: string;
    englishDifference: string;
    example: string;
    englishExample: string;
  }>;
  practiceQuiz: Array<{
    question?: string;
    questionCn?: string;
    word?: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    englishExplanation: string;
  }>;
  quickTips: string[];
  englishQuickTips?: string[];
}

export interface PronunciationAssessment {
  rating: 'bad' | 'poor' | 'ok' | 'good' | 'perfect';
  score: number;
  feedback: string;
  issues?: string[];
}

// --- IELTS Test Parsing Types ---

export interface ListeningQuestion {
  id: number;
  questionNum: string;
  type: 'multiple' | '填空' | '匹配' | '地图' | '表格';
  question: string;
  options?: string[];
  answer?: string;
}

export interface ReadingQuestion {
  id: number;
  questionNum: string;
  passageId: number;
  type: '判断' | '选择' | '填空' | '匹配' | '摘要';
  question: string;
  options?: string[];
  answer?: string;
  keywords?: string[];
}

export interface WritingTask {
  type: 'Task1' | 'Task2';
  prompt: string;
  requirements: string[];
  wordCountTarget: number;
}

export interface SpeakingCard {
  cueCard: string;
  followUpQuestions: string[];
}

export interface ParsedIELTSTest {
  testName: string;
  listening: {
    sections: {
      sectionNum: number;
      questions: ListeningQuestion[];
      audioTiming?: string;
    }[];
  };
  reading: {
    passages: {
      passageNum: number;
      title: string;
      content: string;
      questions: ReadingQuestion[];
    }[];
  };
  writing: {
    task1: WritingTask | null;
    task2: WritingTask | null;
  };
  speaking: {
    cueCards: SpeakingCard[];
  };
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

export const getWordInsights = async (word: string): Promise<WordInsight> => {
  if (!AI_CONFIG.apiKey) throw new Error("API Key is missing. Please check .env file.");

  const prompt = `
    You are an expert IELTS vocabulary teacher explaining to a complete beginner.
    Your goal is to help the user truly UNDERSTAND and REMEMBER the word.
    Provide BOTH Chinese and English explanations for everything.

    Target Word: "${word}"

    Return ONLY valid JSON with this comprehensive schema:

    {
      "wordAnalysis": {
        "word": "the target word",
        "phonetic": "IPA pronunciation with stress",
        "pos": "part of speech (verb/noun/adj/adv)",
        "chineseMeaning": "简单易懂的中文解释",
        "englishDefinition": "simple English definition for beginners"
      },
      "wordRoot": {
        "root": "词根/词缀 (e.g., 'scrib' or 'pre-')",
        "meaning": "词根含义",
        "englishMeaning": "root meaning in English",
        "origin": "拉丁语/希腊语词源说明",
        "englishOrigin": "origin explanation in English",
        "memoryStory": "生动有趣的中文记忆故事或联想",
        "englishMemoryStory": "engaging English memory story or analogy"
      },
      "wordFormation": [
        {
          "word": "派生词",
          "englishWord": "related form in English",
          "pos": "词性 (adj/n/v/adv)",
          "meaning": "中文含义",
          "englishMeaning": "English meaning",
          "example": "中文例句",
          "englishExample": "English example sentence"
        }
      ],
      "synonyms": [
        {
          "word": "同义词",
          "englishWord": "synonym in English",
          "meaning": "中文含义",
          "englishMeaning": "English meaning",
          "usage": "中文用法说明",
          "englishUsage": "English usage explanation",
          "difference": "中文区别说明",
          "englishDifference": "key difference from target word in English",
          "example": "中文例句",
          "englishExample": "English example"
        }
      ],
      "practiceQuiz": [
        {
          "questionCn": "中文填空题题干",
          "question": "English fill-in-the-blank question",
          "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
          "correctAnswer": 0,
          "explanation": "中文解析",
          "englishExplanation": "English explanation"
        }
      ],
      "quickTips": ["中文记忆技巧1", "中文记忆技巧2"],
      "englishQuickTips": ["English memory tip 1", "English memory tip 2"]
    }

    Requirements:
    1. ALL content must include BOTH Chinese and English
    2. Memory story should be fun and memorable (use analogies, scenes, characters)
    3. Word formation must include 5 related words with examples (both languages)
    4. Synonyms must include 5 words at similar difficulty level (both languages)
    5. Practice quiz MUST have exactly 5 questions to test understanding
    6. Use simple language a beginner can understand
  `;

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.modelName,
    messages: [
      { role: "system", content: "You are an IELTS vocab coach. Output JSON only." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error("Empty response from Qwen");
  return JSON.parse(cleanJson(content)) as WordInsight;
};

export const evaluatePronunciation = async (word: string, transcript: string): Promise<PronunciationAssessment> => {
  if (!AI_CONFIG.apiKey) throw new Error("API Key is missing. Please check .env file.");

  const prompt = `
    You are an IELTS pronunciation coach. Evaluate the spoken result based on the target word and ASR transcript.

    Target word: "${word}"
    Transcript: "${transcript}"

    Return ONLY valid JSON with the schema:
    {
      "rating": "bad | poor | ok | good | perfect",
      "score": number (0-100),
      "feedback": "string (short improvement tip)",
      "issues": ["string (likely mispronounced parts)"]
    }
  `;

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.modelName,
    messages: [
      { role: "system", content: "You are a pronunciation coach. Output JSON only." },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error("Empty response from Qwen");
  return JSON.parse(cleanJson(content)) as PronunciationAssessment;
};

// --- IELTS PDF Parsing ---

export const parseIELTSPDF = async (pdfText: string, testName: string): Promise<ParsedIELTSTest> => {
  if (!AI_CONFIG.apiKey) throw new Error("API Key is missing. Please check .env file.");

  console.log(`🚀 AI Starting: Parsing IELTS PDF using model [${AI_CONFIG.modelName}]`);

  try {
    const prompt = `
      You are an expert IELTS test parser. Extract all test content from the PDF text below.

      Test Name: "${testName}"
      PDF Content:
      """
      ${pdfText.substring(0, 15000)}  // Limit to 15000 chars for token limit
      """

      Tasks:
      1. Identify if this is a complete IELTS test or partial
      2. Extract ALL listening questions (Sections 1-4)
      3. Extract ALL reading passages and questions (3 passages)
      4. Extract writing tasks (Task 1 and Task 2)
      5. Extract speaking cue cards if present

      Return ONLY valid JSON with this schema:
      {
        "testName": "string",
        "listening": {
          "sections": [
            {
              "sectionNum": 1-4,
              "questions": [
                {
                  "id": 1,
                  "questionNum": "1-2",
                  "type": "multiple|填空|匹配|地图|表格",
                  "question": "full question text",
                  "options": ["A", "B", "C"]
                }
              ],
              "audioTiming": "e.g. Sections 1-2: 9 minutes"
            }
          ]
        },
        "reading": {
          "passages": [
            {
              "passageNum": 1-3,
              "title": "passage title if available",
              "content": "first 500 chars of passage...",
              "questions": [
                {
                  "id": 1,
                  "questionNum": "1-4",
                  "passageId": 1,
                  "type": "判断|选择|填空|匹配|摘要",
                  "question": "full question text"
                }
              ]
            }
          ]
        },
        "writing": {
          "task1": {
            "type": "Task1",
            "prompt": "full task prompt",
            "requirements": ["at least 150 words", "describe the graph"],
            "wordCountTarget": 150
          },
          "task2": {
            "type": "Task2",
            "prompt": "full essay topic",
            "requirements": ["at least 250 words", "give opinion"],
            "wordCountTarget": 250
          }
        },
        "speaking": {
          "cueCards": [
            {
              "cueCard": "Describe a time when you...",
              "followUpQuestions": ["When?", "Why?", "How did you feel?"]
            }
          ]
        }
      }

      Important:
      - If a section is not present, return empty array/object
      - Be thorough - extract ALL questions
      - Use Chinese for types (填空, 匹配, 判断, etc.)
    `;

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.modelName,
      messages: [
        { role: "system", content: "You are an IELTS test parser. Output valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Empty response from Qwen");

    console.log("✅ AI PDF parsing completed successfully.");

    const result = JSON.parse(cleanJson(content)) as ParsedIELTSTest;
    result.testName = testName; // Override with actual test name
    return result;

  } catch (error) {
    console.error(`❌ PDF Parsing Failed (${AI_CONFIG.modelName}):`, error);
    throw error;
  }
};
