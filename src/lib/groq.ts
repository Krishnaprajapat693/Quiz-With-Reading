import Groq from "groq-sdk";

export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "dummy",
});

export interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export async function generateQuizQuestions(
    topic: string,
    difficulty: "Easy" | "Medium" | "Hard",
    count: number = 5,
    previousWeaknesses?: string
): Promise<QuizQuestion[]> {
    let weaknessPrompt = "";
    if (previousWeaknesses) {
        weaknessPrompt = `The user previously struggled with: ${previousWeaknesses}. Make sure to include some questions targeting these areas to help them improve.`;
    }

    const prompt = `You are an expert educational AI. Generate exactly ${count} multiple-choice test questions about "${topic}" at a "${difficulty}" difficulty level.
${weaknessPrompt}

Return the output STRICTLY as a JSON object with a "questions" key containing an array of question objects.
Each question object must have:
"question": The question text.
"options": An array of exactly 4 strings.
"answer": The string matching the correct option.
"explanation": A concise explanation.

Example:
{
  "questions": [
    {
      "question": "Q text",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "Exp"
    }
  ]
}
`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a JSON-only API. You always return a JSON object with a 'questions' array containing 5 multiple-choice questions."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(content);

        let questions: any[] = [];
        if (Array.isArray(parsed.questions)) {
            questions = parsed.questions;
        } else if (Array.isArray(parsed)) {
            questions = parsed;
        }

        // Validate structure
        const validQuestions = questions.filter(q =>
            q &&
            typeof q.question === "string" &&
            Array.isArray(q.options) &&
            q.options.length >= 2 &&
            typeof q.answer === "string" &&
            typeof q.explanation === "string"
        );

        return validQuestions as QuizQuestion[];

    } catch (error) {
        console.error("Groq API Error:", error);
        throw new Error("Failed to generate quiz questions");
    }
}

export interface QuizReview {
    review: string;
    weakAreas: string[];
    learningTips: string[];
}

export async function generatePerformanceReview(
    topic: string,
    score: number,
    total: number,
    results: { question: string, selected: string, correct: string, explanation: string }[]
): Promise<QuizReview> {
    const prompt = `You are an expert tutor. Analyze the following quiz results and provide a comprehensive performance review.
Topic: ${topic}
Score: ${score}/${total}

Detailed Results:
${JSON.stringify(results, null, 2)}

Return the output STRICTLY as a JSON object with these keys:
"review": A supportive 2-3 sentence summary of overall performance.
"weakAreas": An array of specific concepts or topics the user struggled with based on incorrect answers.
"learningTips": An array of actionable steps or resources to improve in this specific topic.

Example:
{
  "review": "You showed a solid understanding...",
  "weakAreas": ["State management", "Hooks"],
  "learningTips": ["Read the official React docs on useState", "Practice building a counter"]
}
`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful educational AI. You return only JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content || "{}";
        return JSON.parse(content) as QuizReview;
    } catch (error) {
        console.error("Groq Review API Error:", error);
        return {
            review: "We couldn't generate a detailed review at this time.",
            weakAreas: ["General concepts in " + topic],
            learningTips: ["Review the quiz questions and explanations above to identify areas for improvement."]
        };
    }
}

export interface DocSection {
    id: string;
    title: string;
    content: string; // Markdown content for this specific section
    subsections?: DocSection[];
}

export interface StructuredDoc {
    topic: string;
    version: string;
    lastUpdated: string;
    summary: string;
    sections: DocSection[];
}

export async function generatePremiumDoc(topic: string): Promise<StructuredDoc> {
    const prompt = `You are a Technical Knowledge Architect. Your mission is to generate an ABSOLUTELY EXHAUSTIVE, INFINITE-DEPTH documentation suite for the topic: "${topic}".

STRICT DIRECTIVE: MAXIMUM VERBAL PROLIXITY. 
- DO NOT use words like "various", "and so on", "etc.", or "more". LIST EVERYTHING.
- DO NOT summarize. Elucidate every single sub-concept to its absolute limit.
- EVERY section MUST be a standalone technical treatise. If you can write 1000 words, do not write 500.
- If a concept has a history, mention every major milestone and the technical shifts involved.
- If it has a mathematical foundation, provide the formulas in LaTeX.
- If it has code, provide multiple high-performance, industrial-grade implementation examples (C++, Rust, Python, etc.).

STRUCTURE:
- Use a recursive "sections" array. 
- Organize into 5-8 Major Pillars (Foundations, Core Mechanics, Advanced Architectures, Industrial Case Studies, Security, Performance, Ecosystem, Future).
- Deeply nest subsections (3+ levels deep) to cover every micro-detail mentioned in Request 5 (Topic > Subtopic > Sub-subtopic > Detail).

JSON Schema:
{
  "topic": "${topic}",
  "version": "4.0.0 (Exhaustion Mastery)",
  "lastUpdated": "${new Date().toLocaleDateString()}",
  "summary": "A 5-paragraph executive synthesis of the entire domain.",
  "sections": [
    {
       "id": "kebab-case-id",
       "title": "Technical Title",
       "content": "MASSIVE Markdown discourse (min 800 words for leaf nodes)",
       "subsections": [ ... nested sections ... ]
    }
  ]
}

Return ONLY valid JSON.
`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a Technical Knowledge Architect. Output extremely dense, exhaustive JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.35, // Slightly higher for more creative/long output
            max_tokens: 8000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("Empty response from AI");

        return JSON.parse(content) as StructuredDoc;
    } catch (error) {
        console.error("Documentation Generation Error:", error);
        throw error;
    }
}
