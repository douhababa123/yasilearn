
/**
 * AI Service Configuration
 * 
 * This file centralizes the configuration for the AI model.
 * You can verify your API Key reading logic here.
 */

// 1. Reading the API Key
// Priority: 
// 1. Environment Variable (Recommended for security)
// 2. Hardcoded String (Only for local testing, do not commit to Git!)
export const getApiKey = (): string => {
  const key = process.env.DASHSCOPE_API_KEY;
  
  if (!key || key.includes("your-key")) {
    console.warn("⚠️ API Key is missing! Please check your .env file or services/config.ts");
  }
  
  return key || "";
};

// 2. Model Configuration
export const AI_CONFIG = {
  apiKey: getApiKey(),
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  // Priority: .env variable -> Hardcoded 'qwen3-max'
  modelName: process.env.DASHSCOPE_MODEL || "qwen3-max", 
  // Configuration for stability vs creativity
  temperature: 0.3,
};
