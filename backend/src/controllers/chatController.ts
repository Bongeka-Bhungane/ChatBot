import { Request, Response } from "express";
import { getModel } from "../Services/aiService";
import { fetchAllDocsDB } from "../Services/docService";
import { performance } from "perf_hooks";
import { formatDuration } from "../utils/time";
import { MODEL_TYPES } from "../types/modelType";
import { supabase } from "../lib/supabase";

export const chatWithModel = async (req: Request, res: Response) => {
  const { query, modelType } = req.body;

  try {
    // 1. Fetch document context from DB
    const documentContext = await fetchAllDocsDB();

    // 2. Prepare the AI Model and System Prompt
    const model = getModel(modelType);
    const systemPrompt = `${MODEL_TYPES[modelType].systemPrompt}. 
    MODEL_CATEGORY = ${MODEL_TYPES[modelType].category}

    Given the following document context: ${JSON.stringify(documentContext)}.

    1. Appropriateness Check (Algorithm): Is the question appropriate? If the question is not appropriate, set "appropriate": 0, provide the reason in "answer", and do not scan further.

    2. Scope Check (Algorithm): If the question is unrelated to the provided documents, set "inScope": 0, but only if MODEL_CATEGORY is not "Technical & Logical". Otherwise, set "inScope": 1.

    3. Context Scan (AI): Scan the documents. If a response is found, set "answerInContext": 1 and generate the response else set "answerInContext": 0 and set "answer" to exactly: "Your question is either out of context or out of scope. I am referring you to a facilitator for further assistance. and suggest better model to answer the question if any in the list of models: ${JSON.stringify(MODEL_TYPES)}. e.g try using xyz for this and this." but only if MODEL_CATEGORY is not "Technical & Logical", Otherwise, set "answerInContext": 1.

    Format your output as a single JSON object: {"appropriate": 0/1, "inScope": 0/1, "answerInContext": 0/1, "sources": ["fileName.pdf"], "answer": "your string here", "escalated": 0/1}

    ** NOTE: If MODEL_CATEGORY is "Technical & Logical", DO NOT ESCALATE. Note: DO NOT GENERATE CODE. Note: Do not include sources if the question is inappropriate or out of scope. Always reference the specific file name if an answer is provided. If sources are included also include them in your answer e.g ....(According to xyz.pdf). Note: if MODEL_CATEGORY is "Technical & Logical", provide external links for documentation e.g visit https://www.google.com for more information. NOTE: Do not reference ${JSON.stringify(MODEL_TYPES)} in your answer. Note: VERIFY URL's when using them. DO NOT provide unacceptable URL's. **

    When referencing websites check these firsts:
    1. http://w3schools.com/
    2. https://www.freecodecamp.org/
    3. https://www.npmjs.com/
    4. https://react.dev/
    `;

    // 3. Invoke the AI Model
    const startTime = performance.now();
    const response = await model.invoke([
      ["system", systemPrompt],
      ["human", query],
    ]);
    const endTime = performance.now();
    const durationInMs = Math.round(endTime - startTime);

    // 4. Parse AI Output
    // We parse once to handle potential JSON strings from LangChain
    const aiParsed = typeof response.content === 'string' 
        ? JSON.parse(response.content) 
        : response.content;

    const { 
        appropriate, 
        inScope, 
        answerInContext, 
        sources, 
        answer, 
        escalated 
    } = aiParsed;

    // 5. Store Chat Log in Supabase (For FAQ Analytics)
    // Mapping 0/1 integers from AI to Booleans for Supabase
    const { error: logError } = await supabase
      .from('chat_logs')
      .insert([{
        question: query,
        answer: answer,
        source: (sources && sources.length > 0) ? sources.join(", ") : "None",
        inscope: inScope === 1,
        incontext: answerInContext === 1,
        appropriate: appropriate === 1,
        modelused: modelType
      }]);

    if (logError) {
      console.error("Supabase Logging Error:", logError.message);
    }

    // 6. Return response to Frontend
    return res.json({
      appropriate,
      inScope,
      answerInContext,
      sources,
      answer,
      escalated,
      duration: formatDuration(durationInMs),
    });

  } catch (error: any) {
    console.error("ChatController Error:", error);
    return res.status(500).json({ error: "AI failed to respond or parse output." });
  }
};