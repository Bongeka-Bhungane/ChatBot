export type ChatModel = "stepfun" | "trinity" | "nemotron";

export type ModelMeta = {
  label: string;
  description: string;
  bestFor?: string;
};

export const MODEL_META: Record<ChatModel, ModelMeta> = {
  trinity: {
    label: "Trinity",
    description: "Navigation and support.",
    bestFor: "Navigation • Support",
  },
  nemotron: {
    label: "Nemotron",
    description: "Policy and compliance.",
    bestFor: "Policy • Compliance",
  },
  stepfun: {
    label: "Stepfun",
    description: "Technical and logical queries.",
    bestFor: "Technical • Logic",
  },
};

export const Models: ChatModel[] = ["stepfun", "trinity", "nemotron"];

export interface Chat {
  query: string;
  modelType: ChatModel;
}

export interface ChatResponse {
  answer: string;
  duration: string;
}
