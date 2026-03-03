export type ChatLog = {
  id: string;
  question: string | null;
  answer: string | null;
  source: string | null;

  inscope: boolean | null;
  incontext: boolean | null; // ✅ from your table
  appropriate: boolean | null;

  modelused: string | null;

  createdAt: string | null; // ✅ from your table

  language_env: string | null;
  question_type: string | null;
  framework: string | null;

  has_code: boolean | null;
};

export type FetchChatLogsArgs = {
  search?: string;
  lang?: string;
  type?: string;
  framework?: string;
  code?: boolean;
};
