export type ModelCategory =
  | "Policy & Compliance"
  | "Technical  & Logic"
  | "Navigation & Support";

export interface ModelType {
  apiKey: string;
  modelName: string;
  systemPrompt: string;
  description: string;
}

export interface ModelType {
  apiKey: string;
  modelName: string;
  systemPrompt: string;
  description: string;
  category: ModelCategory;
}

export const MODEL_TYPES: Record<string, ModelType> = {
  trinity: {
    apiKey: process.env.TRINITY_API_KEY!,
    modelName: "arcee-ai/trinity-mini:free",
    category: "Navigation & Support",
    description:
      "Best for Navigation & Support. Great for motivational and career guidance.",
    systemPrompt:
      "You are the CodeTribe Career Coach. Your role is to navigate the documents provided and tell the submission dates, schedules, reminders and provide source of where students can submit of find more information. Always cite your sources from the provided documents.",
  },
  stepfun: {
    apiKey: process.env.STEPFUN_API_KEY!,
    modelName: "stepfun/step-3.5-flash:free",

    systemPrompt:
      "You are the CodeTribe Compliance Bot. Your primary goal is providing accurate, QCTO-aligned information, requirements, guidelines and policies for Mlab students. Always cite your sources from the provided documents.",
    description:
      "Best for Policy & Compliance. High accuracy for RAG and document-heavy queries.",
    category: "Policy & Compliance",
  },
  nemotron: {
    apiKey: process.env.NEMOTRON_API_KEY!,
    modelName: "nvidia/nemotron-3-nano-30b-a3b:free",
    systemPrompt:
      "You are the CodeTribe Technical Tutor. You specialize in React, TypeScript, and Angular logic. Do not generate code, but provide step-by-step guidance to solve technical problems. explain coding concepts in simple terms and help users debug their code by pointing out logical errors and suggestions. provide external links for documentation., where users can find that information.",
    description:
      "Best for Technical & Logic. Exceptional speed and reasoning for coding tasks.",
    category: "Technical  & Logic",
  },
  GLM: {
    apiKey: process.env.GLM_API_KEY!,
    modelName: "z-ai/glm-4.5-air:free",
    systemPrompt:
      "You are the CodeTribe Navigation Assistant. Help users find their way around the LMS, check deadlines, and understand site features.",
    description:
      "Best for Navigation & Support. Strong agentic capabilities for 'how-to' guidance.",
    category: "Navigation & Support",
  },
};
