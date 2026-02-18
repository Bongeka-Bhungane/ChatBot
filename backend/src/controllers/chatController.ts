import { Request, Response } from "express";
import { getModel } from "../Services/aiService";
import { fetchAllDocsDB } from "../Services/docService";
import { performance } from "perf_hooks";
import { formatDuration } from "../utils/time";
import { getAllModelsDB } from "../Services/modelService";
import { supabase } from "../lib/supabase";
import { MODEL_TYPES } from "../types/modelType";

export const chatWithModel = async (req: Request, res: Response) => {
  const { query, modelType } = req.body;

  try {
    const documentContext = await fetchAllDocsDB();
    const allModels = await getAllModelsDB();

    // 1. Find the model in the database list
    const currentModel = allModels.find((m: any) => m.name === modelType || m.id === modelType);

    if (!currentModel) {
      console.error("Model not found in DB for type:", modelType);
      return res.status(400).json({ error: "Invalid model selection." });
    }

    // 2. Prepare System Prompt (Original instructions + New Classification)
    const systemPrompt = `${currentModel.systemPrompt}. 
  MODEL_CATEGORY = ${currentModel.category}

Given the following document context: ${JSON.stringify(documentContext)}.

1. Appropriateness Check (Algorithm): Is the question appropriate? If the question is not appropriate, set "appropriate": 0, provide the reason in "answer", and do not scan further.

2. Scope Check (Algorithm): If the question is unrelated to the provided documents, set "inScope": 0, but only if MODEL_CATEGORY is not "Technical & Logical". Otherwise, set "inScope": 1.

3. Context Scan (AI): Scan the documents. If a response is found, set "answerInContext": 1 and generate the response else set "answerInContext": 0 and set "answer" to exactly: "Your question is either out of context or out of scope. I am referring you to a facilitator for further assistance. and suggest better model to answer the question if any in the list of models: ${JSON.stringify(modelType)}. e.g try using xyz for this and this." but only if MODEL_CATEGORY is not "Technical & Logical", Otherwise, set "answerInContext": 1.

4. Classification (Mandatory): 
   - language_env: Identify the primary language (e.g., JavaScript, Python) or "N/A".
   - question_type: Classify as "Conceptual", "Syntax", "How-to", or "Debugging".
   - framework: Identify the framework (e.g., React, Node.js) or "None".
   - has_code: Set to true if your answer contains a code block.

Format your output as a single JSON object: {
  "appropriate": 0/1, 
  "inScope": 0/1, 
  "answerInContext": 0/1, 
  "sources": ["fileName.pdf"], 
  "answer": "your string here", 
  "escalated": 0/1, 
  "externalSources": ["http://example.com"],
  "language_env": "string",
  "question_type": "string",
  "framework": "string",
  "has_code": boolean
}.

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
    // 3. Get Model and Invoke
    const model = getModel(currentModel.name); // Using the verified name from DB
    const startTime = performance.now();

    const aiResponse = await model.invoke([
      ["system", systemPrompt],
      ["human", query],
    ]);

    const durationInMs = Math.round(performance.now() - startTime);
    
    // Clean JSON in case AI adds markdown blocks
    const cleanContent = aiResponse.content.toString().replace(/```json|```/g, "").trim();
    const aiParsed = JSON.parse(cleanContent);

    // 4. Log to Database
    const { error: logError } = await supabase
      .from('chat_logs')
      .insert([{
        question: query,
        answer: aiParsed.answer,
        modelused: currentModel.name,
        appropriate: aiParsed.appropriate === 1,
        inscope: aiParsed.inScope === 1,
        language_env: aiParsed.language_env,
        question_type: aiParsed.question_type,
        framework: aiParsed.framework,
        has_code: aiParsed.has_code,
        incontext: aiParsed.answerInContext === 1,
        createdAt: new Date().toISOString(),
        source: aiParsed.sources?.join(", ") || "None"
      }]);

    if (logError) console.error("Supabase Log Error:", logError);

    // 5. Send Response
    res.json({
      ...aiParsed,
      duration: formatDuration(durationInMs),
    });

  } catch (error: any) {
    console.log("ChatController Error:", error);
    res.status(500).json({ error: "AI failed to respond." });
  }
};