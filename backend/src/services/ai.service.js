import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

// async function run() {
//   const interaction = await ai.interactions.create({
//     model: "gemini-2.5-flash",
//     input: "How does AI work?",
//   });
//   console.log(interaction.output_text);
// }

async function generateAIResponse(content) {
  try {
    const interaction = await ai.interactions.create({
      model: "gemini-2.5-flash",
      input: content,
    });
    return interaction.output_text;
  }
  catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}

export { generateAIResponse };



// run().catch((error) => {
//   console.error("Error:", error);
// })

