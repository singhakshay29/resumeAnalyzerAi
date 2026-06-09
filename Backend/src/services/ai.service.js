const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const chunkIntoObjects = (arr, keys) => {
  if (!arr || !Array.isArray(arr)) return [];
  if (arr.length > 0 && typeof arr[0] === "object") return arr; // already objects
  const result = [];
  for (let i = 0; i < arr.length; i += keys.length * 2) {
    const obj = {};
    keys.forEach((key, j) => {
      obj[key] = arr[i + j * 2 + 1]; // skip the key strings, grab values
    });
    result.push(obj);
  }
  return result;
};

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
  title: z.string().describe("Title of the job for which the interview report is generated"),
  matchScore: z.number(),

  technicalQuestions: z.array(technicalQuestionSchema),

  behaviourQuestions: z.array(behaviourQuestionSchema),

  skillGaps: z.array(skillGapSchema),

  preparationPlan: z.array(preparationPlanSchema),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
      
       "preparationPlan": [
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
      - 7 preparationPlan items
      `;
       
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: zodToJsonSchema(interviewReportSchema),
        },
      });
      const parsed = JSON.parse(response.text);
  
      parsed.technicalQuestions = chunkIntoObjects(parsed.technicalQuestions, ["question", "intention", "answer"]);
      parsed.behaviourQuestions = chunkIntoObjects(parsed.behaviourQuestions, ["question", "intention", "answer"]);
      parsed.skillGaps = chunkIntoObjects(parsed.skillGaps, ["skill", "severity"]);
      parsed.preparationPlan = chunkIntoObjects(parsed.preparationPlan, ["day", "focus", "task"]);
      parsed.preparationPlan = parsed.preparationPlan.map((item) => ({
        ...item,
        task: Array.isArray(item.task) ? item.task : [item.task],
      }));

      console.log("Parsed technicalQuestions:", parsed.technicalQuestions);
  
      const validated = interviewReportSchema.parse(parsed);
      
      return validated;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
  
      if (attempt < maxRetries && (error.status === 503 || error.status === 429)) {
        const delay = 2000 * attempt;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
  
      throw error;
    }
    
  }
}

module.exports = { generateInterviewReport };
