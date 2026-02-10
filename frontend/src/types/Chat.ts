export type ChatModel = "stepfun" | "trinity" | "nemotron"  ;

export const Models = ["stepfun", "trinity", "nemotron"];

export interface Chat {
  query: string;
  modelType: ChatModel;
}

export interface ChatResponse {
  answer: string;
  duration: string
}
