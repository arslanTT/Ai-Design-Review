import Groq from "groq-sdk";
import "dotenv/config";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateAiResponse = async (
  imageURL: string,
  title?: string,
  description?: string
) => {
  try {
    console.log(`Sending Cloudinary URL to Llama 4 Scout: ${imageURL}`);

    const chatCompletion = await groq.chat.completions.create({
      // Updated to the current 2025 vision flagship
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a professional design critic. Please critique this design.
              Title: ${title || "Untitled"}
              User Description: ${description || "No description provided"}
              
              Analyze the visual hierarchy, color harmony, and layout. Provide 3 actionable suggestions.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageURL,
              },
            },
          ],
        },
      ],
      temperature: 0.5, // Slightly lower for more professional, consistent critique
      max_tokens: 1024,
    });
    // console.log("=================", chatCompletion);
    return {
      success: true,
      data: {
        critique:
          chatCompletion.choices[0]?.message?.content ||
          "No critique generated",
        model: "llama-4-scout",
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Groq API error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate critique",
    };
  }
};
