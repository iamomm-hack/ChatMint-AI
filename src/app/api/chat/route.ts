import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === "") {
  console.warn("GEMINI_API_KEY is not set in .env.local");
}

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(req: Request) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid message" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:
        "You are ChatMint AI. You help users create simple, original ideas that could be registered as IP. When you answer, follow these rules strictly: use plain conversational English, do not use headings, do not use bullet points, do not use numbering, do not use quotes, do not use markdown, and keep the answer short, about three to six sentences. Give only one idea in each reply, not multiple variations.",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 220,
      },
    });

    const result = await model.generateContent(message);
    const reply = result.response.text();

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    let errorMessage = "Failed to get AI response";
    
    if (error?.message) {
      if (error.message.includes("fetch failed") || error.message.includes("network")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message.includes("API_KEY") || error.message.includes("authentication")) {
        errorMessage = "Invalid API key. Please check your GEMINI_API_KEY in .env.local";
      } else if (error.message.includes("quota") || error.message.includes("rate limit")) {
        errorMessage = "API quota exceeded. Please try again later.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
