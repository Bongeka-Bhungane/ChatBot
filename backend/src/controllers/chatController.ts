import { Request, Response } from "express";
import { getModel } from "../Services/aiService";
import { fetchAllDocsDB } from "../Services/docService";
import { performance } from "perf_hooks";
import { formatDuration } from "../utils/time";
import { MODEL_TYPES } from "../types/modelType";

export const chatWithModel = async (req: Request, res: Response) => {
  const { query, modelType } = req.body;
  const documentContext = await fetchAllDocsDB();

  const systemPrompt = `${MODEL_TYPES[modelType].systemPrompt}. 
  MODEL_CATEGORY = ${MODEL_TYPES[modelType].category}

Given the following document context: ${JSON.stringify(documentContext)}.

1. Appropriateness Check (Algorithm): Is the question appropriate? If the question is not appropriate, set "appropriate": 0, provide the reason in "answer", and do not scan further.

2. Scope Check (Algorithm): If the question is unrelated to the provided documents, set "inScope": 0, but only if MODEL_CATEGORY is not "Technical & Logical". Otherwise, set "inScope": 1.

3. Context Scan (AI): Scan the documents. If a response is found, set "answerInContext": 1 and generate the response else set "answerInContext": 0 and set "answer" to exactly: "Your question is either out of context or out of scope. I am referring you to a facilitator for further assistance. and suggest better model to answer the question if any in the list of models: ${JSON.stringify(MODEL_TYPES)}. e.g try using xyz for this and this." but only if MODEL_CATEGORY is not "Technical & Logical", Otherwise, set "answerInContext": 1.

Format your output as a single JSON object: {"appropriate": 0/1, "inScope": 0/1, "answerInContext": 0/1, "sources": ["fileName.pdf"], "answer": "your string here", "escalated": 0/1, externalSources: ["http://example.com"]}.

**

NOTE: If MODEL_CATEGORY is "Technical & Logical", DO NOT ESCALATE.

Note: DO NOT GENERATE CODE.

Note: Do not include sources if the question is inappropriate or out of scope. Always reference the specific file name if an answer is provided. If sources are included also include them in your answer e.g ....(According to xyz.pdf)

Note: if MODEL_CATEGORY is "Technical & Logical", provide external links for documentation e.g visit https://www.google.com for more information.

NOTE: Do not reference  ${JSON.stringify(MODEL_TYPES)} in your answer, the response has nothing to do with it.

Note: VERIFY URL's when using them. DO NOT provide unacceptable URL's.

Note: externalSources in the object response should be sources that are in an answer and included in an answer.

**

When referencing websites check these firsts:
1. http://w3schools.com/ - courses, concepts and explanations
2. https://www.freecodecamp.org/ - free online coding tutorials
3. https://www.npmjs.com/ - node package manager
4. https://react.dev/ - react documentation

`;

  try {
    const model = getModel(modelType);

    const startTime = performance.now();
    const response = await model.invoke([
      ["system", systemPrompt],
      ["human", query],
    ]);

    const endTime = performance.now();
    const durationInMs = Math.round(endTime - startTime);

    const { appropriate, inScope, answerInContext } = JSON.parse(
      response.content as string,
    );

    const { sources, answer, escalated, modelCategory, externalSources } =
      JSON.parse(response.content as string);

    res.json({
      appropriate,
      inScope,
      answerInContext,
      sources,
      answer,
      escalated,
      modelCategory,
      duration: formatDuration(durationInMs), // Include response time in milliseconds
      externalSources,
    });
    return;
  } catch (error) {
    console.log("ChatController Error:", error);
    res.status(500).json({ error: "AI failed to respond." });
  }
};
