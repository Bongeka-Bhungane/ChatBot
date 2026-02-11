import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const getModel = (modelName: string) => {
  switch (modelName) {
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
    case "trinity":
      if (!process.env.TRINITY_API_KEY) {
        throw new Error("TRINITY_API_KEY is not configured");
      }
      return new ChatOpenAI({
        apiKey: process.env.TRINITY_API_KEY,
        modelName: "arcee-ai/trinity-mini:free",
        openAIApiKey: process.env.TRINITY_API_KEY,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      });

    case "nemotron":
      if (!process.env.NEMOTRON_API_KEY) {
        throw new Error("NEMOTRON_API_KEY is not configured");
      }
      return new ChatOpenAI({
        apiKey: process.env.NEMOTRON_API_KEY,
        modelName: "nvidia/nemotron-3-nano-30b-a3b:free",
        openAIApiKey: process.env.NEMOTRON_API_KEY,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      });

    default:
      throw new Error("Invalid model selected");
  }
};
