import { Request, Response } from 'express';
import { getModel } from '../Services/aiService';

export const chatWithModel = async (req: Request, res: Response) => {
  const { query, modelType } = req.body;

  // ESCALATION LOGIC: Check for out-of-scope keywords
  const sensitiveKeywords = ['bursary', 'money', 'payment', 'suicide', 'depressed'];
  if (sensitiveKeywords.some(word => query.toLowerCase().includes(word))) {
    return res.json({
      answer: "I've detected this is a sensitive or financial query. I am escalating this to a CodeTribe human facilitator immediately.",
      escalated: true
    });
  }

  try {
    const model = getModel(modelType);
    const response = await model.invoke([
      ["system", "You are the CodeTribe LMS Bot. Answer only using provided context. No grading."],
      ["human", query]
    ]);

    res.json({ answer: response.content, escalated: false });
  } catch (error) {
    res.status(500).json({ error: "AI failed to respond." });
  }
};