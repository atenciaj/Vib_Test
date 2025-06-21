import { Question, ExamCategory } from '../../types';

// The sampleQuestions array has been removed. Questions are now in separate JSON files.

export const fetchQuestionsForCategory = async (category: ExamCategory): Promise<Question[]> => {
  let fileName = '';
  switch (category) {
    case ExamCategory.CAT_I: fileName = 'cat_i.json'; break;
    case ExamCategory.CAT_II: fileName = 'cat_ii.json'; break;
    case ExamCategory.CAT_III: fileName = 'cat_iii.json'; break;
    case ExamCategory.CAT_IV: fileName = 'cat_iv.json'; break;
    default:
      console.error('Unknown category requested:', category);
      throw new Error(`Unknown or unsupported category: ${category}`);
  }
  
  try {
    // Assuming JSON files are in public/data/questions/
    // Adjust the path if your public directory is served differently or files are elsewhere.
    const response = await fetch(`/data/questions/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch questions for ${category} from ${fileName}. Status: ${response.status}`);
    }
    const questions = await response.json() as Question[];
    // Optional: Validate the structure of the fetched questions
    if (!Array.isArray(questions) || questions.some(q => typeof q.id === 'undefined')) {
        console.error("Fetched data is not a valid question array:", questions);
        throw new Error(`Invalid question data format for ${category}`);
    }
    return questions;
  } catch (error) {
    console.error(`Error fetching or parsing questions for ${category}:`, error);
    // Fallback to empty array or re-throw, depending on desired error handling
    // For now, re-throwing to make it clear that data loading failed.
    throw error; 
  }
};

export const selectRandomQuestions = (allQuestions: Question[], count: number): Question[] => {
  if (!allQuestions || allQuestions.length === 0) {
    return [];
  }
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length)); // Ensure not to slice more than available
};

// getQuestionsForCategory is replaced by fetchQuestionsForCategory and selectRandomQuestions logic in ExamContext
// Keeping this comment to note the change from the original file structure.
// export const getQuestionsForCategory = (category: ExamCategory, count: number): Question[] => {
//   const categoryQuestions = sampleQuestions.filter(q => q.category === category);
//   return categoryQuestions.slice(0, count);
// };
