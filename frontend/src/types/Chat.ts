export type ChatModel = "stepfun" | "trinity" | "nemotron";

export type ModelMeta = {
  label: string;
  description: string;

};

export const MODEL_META: Record<ChatModel, ModelMeta> = {
  trinity: {
    label: "Trinity",
    description: "Navigation and support.",
  
  },
  nemotron: {
    label: "Nemotron",
    description: "Technical and logical queries.",
  
  },
  stepfun: {
    label: "Stepfun",
    description: "Policy and compliance.",
   
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
