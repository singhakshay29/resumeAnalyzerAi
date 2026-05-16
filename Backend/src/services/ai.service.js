const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require('zod-to-json-schema');

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number().describe(
      "the match score which is lies between 0 to 100 based on candidate profile and job description"
    ),
  technicalQuestion: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The technical question can be asked during the interview."
          ),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking this technical question."
          ),
        answer: z
          .string()
          .describe(
            "how to answer this questions,what key points to cover,what approch to take etc."
          ),
      })
    )
    .describe(
      "the technical questions that can be asked during the interview."
    ),
  behaviouralQuestion: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The behavioural question can be asked during the interview."
          ),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking this behavioural question."
          ),
        answer: z
          .string()
          .describe(
            "how to answer this questions,what key points to cover,what approch to take etc."
          ),
      })
    )
    .describe(
      "the behavioural questions that can be asked during the interview."
    ),
  skillGap: z
    .array(
      z.object({
        skill: z.string().describe("the skill that candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("the severity of skill gap"),
      })
    )
    .describe(
      "the list of skill gap of the candidate profile along with severity of each skill gap"
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("the day number of preparation plan starting from 1"),
        focus: z.string().describe("the focus area for the day"),
        tasks: z
          .array(z.string())
          .describe(
            "the list of tasks to be completed on that day to follow the preparation plan"
          ),
      })
    )
    .describe(
      "the day-wise preparation plan for the candidate to prepare for the interview"
    ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
                        IMPORTANT:
- Return ONLY valid JSON
- Do not add explanation
- Do not add markdown
- Follow schema exactly
    `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(interviewReportSchema),
        
      },
    });
    console.log("AI Response:", JSON.parse(response.text));
return JSON.parse(response.text);

    
  } catch (error) {
    console.error("Error generating interview report:", error);
  }
}

module.exports = { generateInterviewReport };
