import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

async function seedVideos() {
  console.log("Clearing existing videos...");
  
  // Clear existing data
  await connection.query("DELETE FROM video_quiz_answers");
  await connection.query("DELETE FROM video_progress");
  await connection.query("DELETE FROM video_quiz_questions");
  await connection.query("DELETE FROM video_modules");

  console.log("Seeding new video modules...");

  // Sample videos (1 minute each with basic arithmetic)
  const videos = [
    {
      title: "Basic Addition",
      description: "Practice simple addition problems in 60 seconds.",
      videoUrl: "gradient-animation",
      thumbnailUrl: null,
      duration: 60,
      category: "Mathematics",
      difficulty: "beginner",
      isActive: 1,
    },
    {
      title: "Basic Subtraction",
      description: "Practice simple subtraction problems in 60 seconds.",
      videoUrl: "gradient-animation",
      thumbnailUrl: null,
      duration: 60,
      category: "Mathematics",
      difficulty: "beginner",
      isActive: 1,
    },
    {
      title: "Basic Multiplication",
      description: "Practice simple multiplication problems in 60 seconds.",
      videoUrl: "gradient-animation",
      thumbnailUrl: null,
      duration: 60,
      category: "Mathematics",
      difficulty: "intermediate",
      isActive: 1,
    },
  ];

  for (const video of videos) {
    const [result] = await connection.query(
      `INSERT INTO video_modules (title, description, videoUrl, thumbnailUrl, duration, category, difficulty, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [video.title, video.description, video.videoUrl, video.thumbnailUrl, video.duration, video.category, video.difficulty, video.isActive]
    );
    
    const videoId = result.insertId;
    
    // Add quiz questions every 20 seconds (at 20s, 40s, 60s)
    const quizQuestions = getQuizQuestionsForVideo(videoId, video.category, video.title);
    
    for (const question of quizQuestions) {
      await connection.query(
        `INSERT INTO video_quiz_questions (videoId, pauseTime, question, optionA, optionB, optionC, optionD, correctAnswer, incorrectFeedback, correctFeedback, hintText) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          question.videoId,
          question.pauseTime,
          question.question,
          question.optionA,
          question.optionB,
          question.optionC,
          question.optionD,
          question.correctAnswer,
          question.incorrectFeedback,
          question.correctFeedback,
          question.hintText,
        ]
      );
    }
  }

  console.log(`✅ Successfully seeded ${videos.length} videos with arithmetic quiz questions every 20 seconds`);
  await connection.end();
}

function getQuizQuestionsForVideo(videoId, category, title) {
  if (title === "Basic Addition") {
    return [
      {
        videoId,
        pauseTime: 20,
        question: "What is 15 + 27?",
        optionA: "42",
        optionB: "41",
        optionC: "43",
        optionD: "40",
        correctAnswer: "A",
        incorrectFeedback: "Not quite. Try adding 15 + 27 step by step: 5+7=12 (carry 1), 1+2+1=4, so 42. Watch again!",
        correctFeedback: "Correct! 15 + 27 = 42",
        hintText: "Add the ones place first, then the tens place",
      },
      {
        videoId,
        pauseTime: 40,
        question: "What is 8 + 9?",
        optionA: "16",
        optionB: "17",
        optionC: "18",
        optionD: "15",
        correctAnswer: "B",
        incorrectFeedback: "Try again. 8 + 9 = 17. Review this section!",
        correctFeedback: "Excellent! 8 + 9 = 17",
        hintText: "Think of 8 + 9 as 8 + 10 - 1",
      },
      {
        videoId,
        pauseTime: 60,
        question: "What is 34 + 56?",
        optionA: "89",
        optionB: "90",
        optionC: "91",
        optionD: "88",
        correctAnswer: "B",
        incorrectFeedback: "Not quite. 4+6=10 (carry 1), 3+5+1=9, so 90. Watch the final section again!",
        correctFeedback: "Perfect! 34 + 56 = 90",
        hintText: "Add column by column from right to left",
      },
    ];
  } else if (title === "Basic Subtraction") {
    return [
      {
        videoId,
        pauseTime: 20,
        question: "What is 45 - 18?",
        optionA: "26",
        optionB: "27",
        optionC: "28",
        optionD: "25",
        correctAnswer: "B",
        incorrectFeedback: "Try again. Borrow 1 from 4: 15-8=7, 3-1=2, so 27. Review this section!",
        correctFeedback: "Correct! 45 - 18 = 27",
        hintText: "You may need to borrow from the tens place",
      },
      {
        videoId,
        pauseTime: 40,
        question: "What is 12 - 7?",
        optionA: "4",
        optionB: "6",
        optionC: "5",
        optionD: "3",
        correctAnswer: "C",
        incorrectFeedback: "Not quite. 12 - 7 = 5. Watch again!",
        correctFeedback: "Great! 12 - 7 = 5",
        hintText: "Count backwards from 12",
      },
      {
        videoId,
        pauseTime: 60,
        question: "What is 80 - 35?",
        optionA: "44",
        optionB: "46",
        optionC: "45",
        optionD: "43",
        correctAnswer: "C",
        incorrectFeedback: "Try again. Borrow: 10-5=5, 7-3=4, so 45. Review the final section!",
        correctFeedback: "Excellent! 80 - 35 = 45",
        hintText: "Borrow from the tens place for the ones",
      },
    ];
  } else if (title === "Basic Multiplication") {
    return [
      {
        videoId,
        pauseTime: 20,
        question: "What is 7 × 8?",
        optionA: "54",
        optionB: "56",
        optionC: "58",
        optionD: "52",
        correctAnswer: "B",
        incorrectFeedback: "Not quite. 7 × 8 = 56. Watch this section again!",
        correctFeedback: "Perfect! 7 × 8 = 56",
        hintText: "Think of the multiplication table for 7",
      },
      {
        videoId,
        pauseTime: 40,
        question: "What is 12 × 3?",
        optionA: "34",
        optionB: "35",
        optionC: "36",
        optionD: "37",
        correctAnswer: "C",
        incorrectFeedback: "Try again. 10×3=30, 2×3=6, 30+6=36. Review this section!",
        correctFeedback: "Correct! 12 × 3 = 36",
        hintText: "Think of 12 × 3 as (10 × 3) + (2 × 3)",
      },
      {
        videoId,
        pauseTime: 60,
        question: "What is 9 × 6?",
        optionA: "52",
        optionB: "53",
        optionC: "54",
        optionD: "55",
        correctAnswer: "C",
        incorrectFeedback: "Not quite. 9 × 6 = 54. Watch the final section again!",
        correctFeedback: "Excellent! 9 × 6 = 54",
        hintText: "Use the multiplication table for 9",
      },
    ];
  }
  
  return [];
}

seedVideos().catch((error) => {
  console.error("Error seeding videos:", error);
  process.exit(1);
});
