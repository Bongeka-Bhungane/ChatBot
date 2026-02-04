const { ChatGroq } = require("@langchain/groq");
const { ChatOpenAI } = require("@langchain/openai");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const getModel = (modelName) => {
  console.log(`🔑 Initializing model: ${modelName}`);

  switch (modelName) {
    case "llama": // Fast & Free via Groq
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not configured");
      }
      console.log(
        "🔑 Using Groq API key:",
        process.env.GROQ_API_KEY.substring(0, 10) + "...",
      );
      return new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
        temperature: 0.1, // Low temperature for high accuracy in LMS queries
      });

    case "stepfun":
      if (!process.env.STEPFUN_API_KEY) {
        throw new Error("STEPFUN_API_KEY is not configured");
      }
      return new ChatOpenAI({
        apiKey: process.env.STEPFUN_API_KEY,
        modelName: "stepfun/step-3.5-flash:free",
        openAIApiKey: process.env.STEPFUN_API_KEY,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      });

    case "GLM":
      if (!process.env.GLM_API_KEY) {
        throw new Error("GLM_API_KEY is not configured");
      }
      return new ChatOpenAI({
        apiKey: process.env.GLM_API_KEY,
        modelName: "z-ai/glm-4.5-air:free",
        openAIApiKey: process.env.GLM_API_KEY,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      });

    default:
      throw new Error(
        `Invalid model selected: ${modelName}. Available models: llama, stepfun, GLM`,
      );
  }
};

module.exports = { getModel };
