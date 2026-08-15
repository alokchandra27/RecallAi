import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function run() {
  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input: "How does AI work?",
  });
  console.log(interaction.output_text);
}



run().catch((error) => {
  console.error("Error:", error);
})

