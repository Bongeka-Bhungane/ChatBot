const { ChatGroq } = require("@langchain/groq");
const { ChatOpenAI } = require("@langchain/openai");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const getModel = (modelName) => {
  console.log(`🔑 Initializing model: ${modelName}`);
  
  switch (modelName) {
    case 'llama': // Fast & Free via Groq
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not configured");
      }
      console.log('🔑 Using Groq API key:', process.env.GROQ_API_KEY.substring(0, 10) + '...');
      return new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
        temperature: 0.1, // Low temperature for high accuracy in LMS queries
      });
      
    case 'claude':
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }
      console.log('🔑 Using OpenRouter API key:', process.env.OPENROUTER_API_KEY.substring(0, 15) + '...');
      return new ChatOpenAI({ 
        apiKey: process.env.OPENROUTER_API_KEY,
        modelName: "anthropic/claude-3.5-sonnet",
        openAIApiKey: process.env.OPENROUTER_API_KEY,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1"
        }
      });

    case 'gemini':
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
      }
      console.log('🔑 Using Google API key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY.substring(0, 10) + '...');
      return new ChatGoogleGenerativeAI({ 
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        model: "gemini-pro" 
      });

    default:
      throw new Error(`Invalid model selected: ${modelName}. Available models: llama, claude, gemini`);
  }
};

module.exports = { getModel };
