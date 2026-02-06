import { Request, Response } from "express";
import { getModel } from "../Services/aiService";
import { fetchAllDocsDB } from "../Services/docService";

export const chatWithModel = async (req: Request, res: Response) => {
  const { query, modelType } = req.body;

  // ESCALATION LOGIC: Check for out-of-scope keywords
  const sensitiveKeywords = [
    "bursary",
    "money",
    "payment",
    "suicide",
    "depressed",
  ];
  if (sensitiveKeywords.some((word) => query.toLowerCase().includes(word))) {
    return res.json({
      answer:
        "I've detected this is a sensitive or financial query. I am escalating this to a CodeTribe human facilitator immediately.",
      escalated: true,
    });
  }

  const documentContext = await fetchAllDocsDB();

  const systemPrompt = `You are the CodeTribe LMS Bot. Answer only using provided context. No grading. Take these objects ${JSON.stringify(documentContext)} as documents and make sure to reference the file name in your answer. Asnwer these 3 questions: 1. Is the question appropriate for the LMS answer with 0 or 1? 2. Is the question out of scope? meaning it's not related to context provided answer with 0 or 1?. 3. Is the answer found within the context provided? answer with 0 or 1? Make sure the response is like e.g {approprite: 1, inScope: 1, answerInContext: 1, aswer: "your answer here"}.`;

  try {
    const model = getModel(modelType);
    const response = await model.invoke([
      ["system", systemPrompt],
      ["human", query],
    ]);

    res.json({ answer: response.content, escalated: false });
  } catch (error) {
    res.status(500).json({ error: "AI failed to respond." });
  }
};
