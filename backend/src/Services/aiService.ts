import { ChatOpenAI } from "@langchain/openai";

export const getModel = (modelName: string) => {
  // Normalize the name to handle case sensitivity
  const normalizedName = modelName.toLowerCase().trim();

  switch (normalizedName) {
    case "stepfun":
      if (!process.env.STEPFUN_API_KEY) throw new Error("STEPFUN_API_KEY is not configured");
      return new ChatOpenAI({
        apiKey: process.env.STEPFUN_API_KEY,
        modelName: "stepfun/step-3.5-flash:free",
        openAIApiKey: process.env.STEPFUN_API_KEY,
        configuration: { baseURL: "https://openrouter.ai/api/v1" },
      });

    case "glm":
      if (!process.env.GLM_API_KEY) throw new Error("GLM_API_KEY is not configured");
      return new ChatOpenAI({
        apiKey: process.env.GLM_API_KEY,
        modelName: "z-ai/glm-4.5-air:free",
        openAIApiKey: process.env.GLM_API_KEY,
        configuration: { baseURL: "https://openrouter.ai/api/v1" },
      });

    case "trinity":
      if (!process.env.TRINITY_API_KEY) throw new Error("TRINITY_API_KEY is not configured");
      return new ChatOpenAI({
        apiKey: process.env.TRINITY_API_KEY,
        modelName: "arcee-ai/trinity-mini:free",
        openAIApiKey: process.env.TRINITY_API_KEY,
        configuration: { baseURL: "https://openrouter.ai/api/v1" },
      });

    case "nemotron":
      if (!process.env.NEMOTRON_API_KEY) throw new Error("NEMOTRON_API_KEY is not configured");
      return new ChatOpenAI({
        apiKey: process.env.NEMOTRON_API_KEY,
        modelName: "nvidia/nemotron-3-nano-30b-a3b:free",
        openAIApiKey: process.env.NEMOTRON_API_KEY,
        configuration: { baseURL: "https://openrouter.ai/api/v1" },
      });

    default:
      // This will help you see exactly what string is failing in your terminal
      console.error(`Backend Error: The model name "${modelName}" did not match any case.`);
      throw new Error(`Invalid model selected: ${modelName}`);
  }
};