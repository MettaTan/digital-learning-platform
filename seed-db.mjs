import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// Define schema inline for seeding
const quizQuestions = {
  id: "id",
  question: "question",
  optionA: "optionA",
  optionB: "optionB",
  optionC: "optionC",
  optionD: "optionD",
  correctAnswer: "correctAnswer",
  difficulty: "difficulty",
  category: "category",
};

async function seed() {
  console.log("Checking if questions already exist...");
  
  const [existingQuestions] = await connection.query("SELECT COUNT(*) as count FROM quiz_questions");
  
  if (existingQuestions[0].count > 0) {
    console.log(`Database already has ${existingQuestions[0].count} questions. Skipping seed.`);
    await connection.end();
    return;
  }

  console.log("Seeding quiz questions...");

  const questions = [
    {
      question: "Which of the following is the term for surgical complications resulting from surgical sponges left inside the patient's body?",
      optionA: "Gauze grievance disorder",
      optionB: "Retained surgical sponge syndrome",
      optionC: "Post-absorbed hemostasis",
      optionD: "Fabric foreign object syndrome",
      correctAnswer: "B",
      difficulty: "medium",
      category: "Medical",
    },
    {
      question: "What is the capital of France?",
      optionA: "London",
      optionB: "Berlin",
      optionC: "Paris",
      optionD: "Madrid",
      correctAnswer: "C",
      difficulty: "easy",
      category: "Geography",
    },
    {
      question: "Which planet is known as the Red Planet?",
      optionA: "Venus",
      optionB: "Mars",
      optionC: "Jupiter",
      optionD: "Saturn",
      correctAnswer: "B",
      difficulty: "easy",
      category: "Science",
    },
    {
      question: "What is the largest ocean on Earth?",
      optionA: "Atlantic Ocean",
      optionB: "Indian Ocean",
      optionC: "Arctic Ocean",
      optionD: "Pacific Ocean",
      correctAnswer: "D",
      difficulty: "easy",
      category: "Geography",
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      optionA: "Charles Dickens",
      optionB: "William Shakespeare",
      optionC: "Jane Austen",
      optionD: "Mark Twain",
      correctAnswer: "B",
      difficulty: "easy",
      category: "Literature",
    },
    {
      question: "What is the smallest prime number?",
      optionA: "0",
      optionB: "1",
      optionC: "2",
      optionD: "3",
      correctAnswer: "C",
      difficulty: "medium",
      category: "Mathematics",
    },
    {
      question: "Which programming language is known for its use in web development and has a coffee-related name?",
      optionA: "Python",
      optionB: "Java",
      optionC: "C++",
      optionD: "Ruby",
      correctAnswer: "B",
      difficulty: "easy",
      category: "Technology",
    },
    {
      question: "What is the chemical symbol for gold?",
      optionA: "Go",
      optionB: "Gd",
      optionC: "Au",
      optionD: "Ag",
      correctAnswer: "C",
      difficulty: "medium",
      category: "Science",
    },
    {
      question: "In which year did World War II end?",
      optionA: "1943",
      optionB: "1944",
      optionC: "1945",
      optionD: "1946",
      correctAnswer: "C",
      difficulty: "medium",
      category: "History",
    },
    {
      question: "What is the speed of light in vacuum?",
      optionA: "299,792,458 m/s",
      optionB: "300,000,000 m/s",
      optionC: "299,000,000 m/s",
      optionD: "298,792,458 m/s",
      correctAnswer: "A",
      difficulty: "hard",
      category: "Physics",
    },
    {
      question: "Which element has the atomic number 1?",
      optionA: "Helium",
      optionB: "Hydrogen",
      optionC: "Oxygen",
      optionD: "Carbon",
      correctAnswer: "B",
      difficulty: "easy",
      category: "Chemistry",
    },
    {
      question: "What is the largest mammal in the world?",
      optionA: "African Elephant",
      optionB: "Blue Whale",
      optionC: "Giraffe",
      optionD: "Polar Bear",
      correctAnswer: "B",
      difficulty: "easy",
      category: "Biology",
    },
    {
      question: "Which country is home to the kangaroo?",
      optionA: "New Zealand",
      optionB: "South Africa",
      optionC: "Australia",
      optionD: "India",
      correctAnswer: "C",
      difficulty: "easy",
      category: "Geography",
    },
    {
      question: "What does CPU stand for?",
      optionA: "Central Processing Unit",
      optionB: "Computer Personal Unit",
      optionC: "Central Program Utility",
      optionD: "Computer Processing Utility",
      correctAnswer: "A",
      difficulty: "easy",
      category: "Technology",
    },
    {
      question: "How many continents are there on Earth?",
      optionA: "5",
      optionB: "6",
      optionC: "7",
      optionD: "8",
      correctAnswer: "C",
      difficulty: "easy",
      category: "Geography",
    },
  ];

  for (const q of questions) {
    await connection.query(
      `INSERT INTO quiz_questions (question, optionA, optionB, optionC, optionD, correctAnswer, difficulty, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [q.question, q.optionA, q.optionB, q.optionC, q.optionD, q.correctAnswer, q.difficulty, q.category]
    );
  }

  console.log(`✅ Successfully seeded ${questions.length} quiz questions`);
  await connection.end();
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
