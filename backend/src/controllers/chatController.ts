import { Request, Response } from "express";
import { getModel } from "../Services/aiService";
import { fetchAllDocsDB } from "../Services/docService";

export const chatWithModel = async (req: Request, res: Response) => {
  const { query, modelType } = req.body;

  const documentContext = await fetchAllDocsDB();

  const systemPrompt = `You are the CodeTribe LMS Bot. Your behavior must strictly follow the provided logic flow: first, check for appropriateness; second, determine if the query is in-scope based on the provided documents; third, scan the documents for a valid response. Use these objects as your document context: ${JSON.stringify(documentContext)}.

Mandatory Response Requirements:

Appropriateness Check (Algorithm): If the question is inappropriate, set "appropriate": 0, provide the reason in "answer", and do not scan further.

Scope Check (Algorithm): If the question is unrelated to the provided documents, set "inScope": 0.

Context Scan (AI): Scan the documents. If a response is found, set "answerInContext": 1 and generate the response.

Escalation Path: If the question is in-scope but the answer is NOT found in the context, set "answerInContext": 0 and set "answer" to exactly: "Your question is either out of context or out of scope. I am referring you to a facilitator for further assistance."

Format your output as a single JSON object: {"appropriate": 0/1, "inScope": 0/1, "answerInContext": 0/1, "sources": ["fileName.pdf"], "answer": "your string here"}

Note: Do not include sources if the question is inappropriate or out of scope. Always reference the specific file name if an answer is provided.`;

  try {
    const model = getModel(modelType);
    const response = await model.invoke([
      ["system", systemPrompt],
      ["human", query],
    ]);

    const { appropriate, inScope, answerInContext } = JSON.parse(
      response.content as string,
    );

    const { sources, answer } = JSON.parse(response.content as string);

    res.json({
      appropriate,
      inScope,
      answerInContext,
      sources,
      answer,
      escalated: !inScope || !appropriate, // Escalate if not appropriate or out of scope
    });
    return;
  } catch (error) {
    console.log("ChatController Error:", error);
    res.status(500).json({ error: "AI failed to respond." });
  }
};
