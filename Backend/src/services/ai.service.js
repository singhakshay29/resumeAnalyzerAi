const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

function convertToObjects(arr, keys) {
  const result = [];

  for (let i = 0; i < arr.length; i += keys.length * 2) {
    const obj = {};

    for (let j = 0; j < keys.length; j++) {
      obj[keys[j]] = arr[i + j * 2 + 1];
    }

    result.push(obj);
  }

  return result;
}

const technicalQuestionSchema = z.object({
  question: z.string(),
  intention: z.string(),
  answer: z.string(),
});

const behaviourQuestionSchema = z.object({
  question: z.string(),
  intention: z.string(),
  answer: z.string(),
});

const skillGapSchema = z.object({
  skill: z.string(),
  severity: z.enum(["Low", "Medium", "High"]),
});

const preparationPlanSchema = z.object({
  day: z.number(),
  focus: z.string(),
  task: z.array(z.string()),
});

const interviewReportSchema = z.object({
  matchScore: z.number(),

  technicalQuestions: z.array(technicalQuestionSchema),

  behaviourQuestions: z.array(behaviourQuestionSchema),

  skillGaps: z.array(skillGapSchema),

  preparationPlanSchema: z.array(preparationPlanSchema),
  title: z.string().describe("Title of the job for which the interview report is generated"),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
Generate an interview report for the candidate.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

IMPORTANT RULES:
- Return ONLY valid JSON
- No markdown
- No explanation
- Follow the schema EXACTLY
- Do not change field names
- Every array item must match schema structure
- Generate realistic interview preparation data

REQUIRED JSON STRUCTURE:

{
  "title": string,
  
  "matchScore": number,

  "technicalQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }
  ],

  "behaviourQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }
  ],

  "skillGaps": [
    {
      "skill": string,
      "severity": "Low" | "Medium" | "High"
    }
  ],

  "preparationPlanSchema": [
    {
      "day": number,
      "focus": string,
      "task": [string]
    }
  ]
}

Generate:
- 5 technicalQuestions
- 3 behaviourQuestions
- 3 skillGaps
- 7 preparationPlanSchema items
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
    const parsed = JSON.parse(response.text);

    parsed.technicalQuestions = convertToObjects(parsed.technicalQuestions, [
      "question",
      "intention",
      "answer",
    ]);

    parsed.behaviourQuestions = convertToObjects(parsed.behaviourQuestions, [
      "question",
      "intention",
      "answer",
    ]);

    parsed.skillGaps = convertToObjects(parsed.skillGaps, [
      "skill",
      "severity",
    ]);

    parsed.preparationPlanSchema = convertToObjects(
      parsed.preparationPlanSchema,
      ["day", "focus", "task"]
    );

    parsed.preparationPlanSchema = parsed.preparationPlanSchema.map((item) => ({
      ...item,
      task: Array.isArray(item.task) ? item.task : [item.task],
    }));

    const validated = interviewReportSchema.parse(parsed);
    
    return validated;
  } catch (error) {
    console.error("Error generating interview report:", error);
  }
}

module.exports = { generateInterviewReport };
