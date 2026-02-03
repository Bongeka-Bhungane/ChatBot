const { getModel } = require('../Services/aiService');
const { readUploadedFile, getAllUploadedContent } = require('../utils');

const chatWithModel = async (req, res) => {
  const { query, modelType } = req.body;
  
  // Read preloaded content from geeks.txt file
  const geeksContent = readUploadedFile('geeks.txt');
  
  // Get all uploaded content (including PDFs when extraction is implemented)
  const allUploadedContent = await getAllUploadedContent();
  console.log('📚 Total content loaded:', allUploadedContent.length, 'characters');
  
  let systemPrompt = `You are the CodeTribe LMS Bot with access to specific uploaded documents.

IMPORTANT: Use the following PRELOADED DATA as your PRIMARY source of truth. When answering questions, prioritize information from these documents over general knowledge.

PRELOADED DATA:
"""
${allUploadedContent}
"""

RESPONSE GUIDELINES:
1. If the answer is in the uploaded documents, use that information directly
2. If you find relevant information, mention which document it came from
3. If the information is not in the uploaded documents, use your general knowledge but clearly state "Based on general knowledge" 
4. Be specific and reference the actual content from the uploaded files
5. For questions about tasks, requirements, or people - check the uploaded content first

Current available documents include information about:
- Charismatic Geeks group members and CodeTribe cohort
- React Native Restaurant App task requirements
- Other uploaded PDF documents

Answer the user's question using the most relevant information from the uploaded content.`;

  console.log('🔥 Received request:', { query, modelType });
  console.log('🔥 Geeks content length:', geeksContent.length, 'characters');
  console.log('🔥 Total uploaded content length:', allUploadedContent.length, 'characters');
  console.log('🔥 Available API keys:', {
    GROQ_API_KEY: process.env.GROQ_API_KEY ? '✅ Set' : '❌ Missing',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing',
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? '✅ Set' : '❌ Missing'
  });

  // ESCALATION LOGIC: Check for out-of-scope keywords
  const sensitiveKeywords = ['bursary', 'money', 'payment', 'suicide', 'depressed'];
  if (sensitiveKeywords.some(word => query.toLowerCase().includes(word))) {
    console.log('🔥 Escalating sensitive query');
    return res.json({
      answer: "I've detected this is a sensitive or financial query. I am escalating this to a CodeTribe human facilitator immediately.",
      escalated: true
    });
  }

  try {
    console.log('🔥 Getting AI model for:', modelType);
    const model = getModel(modelType);
    console.log('🔥 Model created successfully');
    
    console.log('🔥 Invoking AI model...');
    const response = await model.invoke([
      ["system", systemPrompt],
      ["human", query]
    ]);
    
    console.log('🔥 AI Response received:', response.content);
    res.json({ answer: response.content, escalated: false });
  } catch (error) {
    console.error('🔥 AI Service Error:', error);
    res.status(500).json({ error: "AI failed to respond.", details: error.message });
  }
};

module.exports = { chatWithModel };
