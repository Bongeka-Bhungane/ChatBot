export type ModelCategory =
  | "Policy & Compliance"
  | "Technical  & Logic"
  | "Navigation & Support";

export interface Model {
  id?: string;
  apiKey: string;
  name: string;
  fullName: string;
  systemPrompt: string;
  category: ModelCategory;
  createdAt: Date;
  updatedAt: Date;
}
