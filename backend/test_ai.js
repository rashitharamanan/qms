const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, "v1");
    // There isn't a direct listModels in the client, we have to use the API directly or check docs.
    // Actually, in the newer SDK, you can't easily list them without the management client.
    
    // Let's try gemini-1.5-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Model initialized. Trying simple prompt...");
    const result = await model.generateContent("test");
    console.log("Success!");
  } catch (error) {
    console.error("Error code:", error.status);
    console.error("Error message:", error.message);
  }
}

listModels();
