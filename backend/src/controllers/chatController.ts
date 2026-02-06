import { Request, Response } from "express";
import { getModel } from "../Services/aiService";
import { fetchAllDocsDB } from "../Services/docService";

export const chatWithModel = async (req: Request, res: Response) => {
  const { query, modelType } = req.body;

  const documentContext = await fetchAllDocsDB();

  const systemPrompt = `You are the CodeTribe LMS Bot. Answer only using provided context. No grading. Take these objects ${JSON.stringify(documentContext)} as documents and make sure to reference the file name in your answer. Asnwer these 3 questions: 1. Is the question appropriate for the LMS answer with 0 or 1? 2. Is the question out of scope? meaning it's not related to context provided answer with 0 or 1?. 3. Is the answer found within the context provided? answer with 0 or 1? Make sure the response is like e.g {"appropriate": 1, "inScope": 1, "answerInContext": 1, "sources": ["file1.pdf", "file2.pdf"], "answer": "your answer here"}. do not include any sources if answer is out of scope or inappropriate`;

  try {
    const model = getModel(modelType);
    const response = await model.invoke([
      ["system", systemPrompt],
      ["human", query],
    ]);

    const { appropriate, inScope, answerInContext } = JSON.parse(
      response.content as string,
    );

    // const { appropriate, inScope, answerInContext, sources, answer } =
    //   JSON.parse(response.content as string);

    if (!inScope || !appropriate) {
      res.json({
        answer:
          "Your question is either inappropriate or out of scope. I am referring you to a facilitator for further assistance.",
      });
    }

    const { sources, answer } = JSON.parse(response.content as string);

    res.json({
      appropriate,
      inScope,
      answerInContext,
      sources,
      answer,
      escalated: !inScope || !appropriate, // Escalate if not appropriate or out of scope
    });
    res.json({ response: response.content });
  } catch (error) {
    console.log("ChatController Error:", error);
    res.status(500).json({ error: "AI failed to respond." });
  }
};
