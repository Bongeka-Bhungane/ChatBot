export type ChatModel = "llama" | "GLM" | "stepfun" | "trinity" | "nemotron"  ;

export const Models = ["llama", "GLM", "stepfun", "trinity", "nemotron"];

export interface Chat {
  query: string;
  modelType: ChatModel;
}

export interface ChatResponse {
  answer: string;
}
