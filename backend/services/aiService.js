const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_KEY_HERE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Predict wait time based on queue details
 */
exports.predictWaitTime = async (queueData) => {
  try {
    const { totalPeople, shopType, averageServiceTime } = queueData;
    
    const prompt = `As an expert queue analyst, estimate the total wait time for a customer who is #${totalPeople + 1} in a queue at a ${shopType}. 
    The current average service time is ${averageServiceTime || 'unknown'} minutes per person. 
    Provide a realistic range (e.g., "15-20 minutes") and a very short explanation of why. 
    Format the response as a JSON object: { "estimate": "string", "explanation": "string" }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON if needed
    const jsonMatch = text.match(/\{.*\}/s);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { estimate: `${totalPeople * 5} mins`, explanation: "Based on average count" };
  } catch (error) {
    console.error("AI Prediction Error:", error);
    // Fallback to a smart heuristic if AI fails
    const { totalPeople, averageServiceTime } = queueData;
    const wait = totalPeople * (averageServiceTime || 15);
    return { 
      estimate: `${wait}-${wait + 10} mins`, 
      explanation: "Heuristic estimate (AI Advisor offline)." 
    };
  }
};

/**
 * General Chatbot logic
 */
exports.getChatResponse = async (userMessage, context) => {
  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `You are an AI assistant for a Queue Management System called QueueMS. 
          Context: ${JSON.stringify(context)}. 
          Be helpful, concise, and friendly.` }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to help users with their queue and shop inquiries." }],
        },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
};

/**
 * Get Shop Recommendations
 */
exports.getRecommendations = async (userHistory, allShops) => {
  try {
    const prompt = `Based on the user's visit history: ${JSON.stringify(userHistory)}, 
    and the list of available shops: ${JSON.stringify(allShops.map(s => ({ id: s._id, name: s.shopName, category: s.category?.name })))}, 
    recommend the top 3 shops the user might like. 
    Return only a JSON array of shop IDs. Example: ["id1", "id2", "id3"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const idsMatch = text.match(/\[.*\]/s);
    return idsMatch ? JSON.parse(idsMatch[0]) : [];
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
};
