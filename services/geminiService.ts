
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CaseStudyData } from '../types';
import { GEMINI_API_MODEL_TEXT } from '../constants';

const getApiKey = (): string | undefined => {
  // Try localStorage first, then environment variable
  const storedKey = localStorage.getItem('GEMINI_API_KEY');
  if (storedKey) return storedKey;
  return process.env.API_KEY;
};


const getAiClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY not found. Please set it in settings or as an environment variable.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCaseStudy = async (topic: string): Promise<CaseStudyData> => {
  const ai = getAiClient();
  const model = GEMINI_API_MODEL_TEXT;

  const prompt = `
Generate a detailed vibration analysis case study for educational purposes, focusing on the topic: "${topic}".
The case study should be relevant to real-world industrial scenarios encountered by Vibration Analysts (ISO 18436-2).

Please structure your response with the following distinct sections, using Markdown headings:

# Case Study: ${topic}

(Provide a detailed scenario here. Include background information, machine type, observed symptoms, and any initial data if applicable. Make it engaging and problematic.)

# Assignment

(Pose 2-3 specific questions or tasks for the student to solve based on the case study. These should require application of vibration analysis principles related to "${topic}".)

# Grading Rubric

(Provide a simple grading rubric for the assignment. For example, points for correct diagnosis, logical reasoning, correct use of terminology, clarity of explanation, etc.)

# Answer Sheet / Detailed Explanation

(Provide a comprehensive answer sheet for the assignment questions. Explain the reasoning, any calculations involved, and define key terms used. This should serve as a learning tool.)

Ensure the content is technically accurate and suitable for someone preparing for Vibration Analyst certification.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    const text = response.text;
    
    // Parse the markdown content
    const caseStudyText = extractSection(text, "Case Study", topic);
    const assignment = extractSection(text, "Assignment");
    const gradingRubric = extractSection(text, "Grading Rubric");
    const answerSheet = extractSection(text, "Answer Sheet / Detailed Explanation");

    if (!caseStudyText || !assignment || !gradingRubric || !answerSheet) {
        console.error("Failed to parse all sections from Gemini response. Raw text:", text);
        throw new Error("Failed to parse the complete case study structure from AI response. Some sections might be missing.");
    }

    return {
      topic,
      caseStudyText,
      assignment,
      gradingRubric,
      answerSheet,
    };
  } catch (error) {
    console.error('Error generating case study with Gemini:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate case study: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the case study.');
  }
};

// Helper function to extract content under a specific Markdown heading
const extractSection = (markdownText: string, headingText: string, defaultTopicForCaseStudy?: string): string => {
  // Regex to find a heading and capture content until the next heading of the same or higher level, or end of text.
  // Handles both '#' and '##' etc.
  const headingPattern = new RegExp(`^#+\\s*${escapeRegExp(headingText)}\\s*(?:\\n|$)`, "im");
  const match = markdownText.match(headingPattern);

  if (!match || typeof match.index === 'undefined') {
    // If it's the main "Case Study" heading and it's missing, try to find the topic name as heading
    if (headingText === "Case Study" && defaultTopicForCaseStudy) {
        const topicPattern = new RegExp(`^#+\\s*Case Study:\\s*${escapeRegExp(defaultTopicForCaseStudy)}\\s*(?:\\n|$)`, "im");
        const topicMatch = markdownText.match(topicPattern);
        if (topicMatch && typeof topicMatch.index !== 'undefined') {
            const contentStartIndex = topicMatch.index + topicMatch[0].length;
            const nextHeadingPattern = /^#+\s/m;
            let contentEndIndex = markdownText.length;
            const nextMatch = markdownText.substring(contentStartIndex).match(nextHeadingPattern);
            if (nextMatch && typeof nextMatch.index !== 'undefined') {
                contentEndIndex = contentStartIndex + nextMatch.index;
            }
            return markdownText.substring(contentStartIndex, contentEndIndex).trim();
        }
    }
    return ""; // Section not found
  }

  const contentStartIndex = match.index + match[0].length;
  // Find the next heading of the same or higher level
  const nextHeadingPattern = /^#+\s/m;
  let contentEndIndex = markdownText.length;

  const restOfText = markdownText.substring(contentStartIndex);
  const nextMatch = restOfText.match(nextHeadingPattern);

  if (nextMatch && typeof nextMatch.index !== 'undefined') {
    contentEndIndex = contentStartIndex + nextMatch.index;
  }
  
  return markdownText.substring(contentStartIndex, contentEndIndex).trim();
};

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}