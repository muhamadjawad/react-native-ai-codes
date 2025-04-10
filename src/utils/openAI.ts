// src/utils/openAI.ts
import { GROQ_API_KEY } from "@env";
// src/utils/groqAPI.ts
export const fetchGroqResponse = async (prompt: string) => {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: [{ role: 'user', content: prompt }]
            })
        });
        const data = await response.json();

        return data.choices[0]?.message?.content;
    } catch (error: any) {
        return "Error: " + error.message;
    }
};