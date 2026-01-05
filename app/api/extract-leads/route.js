import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// import jwt from "jsonwebtoken"; // Add this if you install jsonwebtoken

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Optional: Verify token with jwt.verify(token, process.env.JWT_SECRET)

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");

        const prompt = `
            Analyze this image of a handwritten or printed list of leads.
            Extract the following information for each lead:
            - Name (if available)
            - Email (if available)
            - Phone Number (MANDATORY - if a row has no phone number, skip it)

            IMPORTANT: Format the Phone Number in E.164 format (e.g. +14155552671). 
            - If the number has brackets like (416) 123-4567, convert it to +14161234567 (assuming US/Canada if no country code is obvious).
            - Remove dashes, spaces, and brackets.
            - Ensure it starts with a '+'.

            Return ONLY a valid JSON array of objects with keys: "name", "email", "phoneNumber".
            Example:
            [
                { "name": "John Doe", "email": "john@example.com", "phoneNumber": "+1234567890" }
            ]
            Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: file.type || "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up the response in case it contains markdown
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const leads = JSON.parse(cleanedText);
            return NextResponse.json({ leads });
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", text);
            return NextResponse.json({ error: "Failed to parse extracted data" }, { status: 500 });
        }

    } catch (error) {
        console.error("Error extracting leads:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
