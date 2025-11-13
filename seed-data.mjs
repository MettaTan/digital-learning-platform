import { drizzle } from "drizzle-orm/mysql2";
import { mysqlTable, int, varchar, text, timestamp, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  totalQuestions: int("totalQuestions").notNull(),
  creditsReward: int("creditsReward").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  questionText: text("questionText").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC").notNull(),
  optionD: text("optionD").notNull(),
  correctAnswer: mysqlEnum("correctAnswer", ["A", "B", "C", "D"]).notNull(),
  orderIndex: int("orderIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const rewards = mysqlTable("rewards", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  creditCost: int("creditCost").notNull(),
  category: mysqlEnum("category", [
    "facilities",
    "exam",
    "quiz",
    "grades",
    "voucher",
    "parking"
  ]).notNull(),
  available: boolean("available").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding database...");

  // Create a sample quiz
  const [quizResult] = await db.insert(quizzes).values({
    title: "Quiz with Bg 1",
    description: "Medical terminology and procedures quiz",
    totalQuestions: 10,
    creditsReward: 100,
  });

  const quizId = Number(quizResult.insertId);

  // Add questions
  const sampleQuestions = [
    {
      quizId,
      questionText: "Which of the following is the term for surgical complications resulting from surgical sponges left inside the patient's body?",
      optionA: "Gauze grievance disorder",
      optionB: "Retained surgical sponge syndrome",
      optionC: "Wound-induced hepatoma",
      optionD: "Fabric foreign object syndrome",
      correctAnswer: "B",
      orderIndex: 1,
    },
    {
      quizId,
      questionText: "What is the medical term for inflammation of the heart muscle?",
      optionA: "Myocarditis",
      optionB: "Pericarditis",
      optionC: "Endocarditis",
      optionD: "Cardiomyopathy",
      correctAnswer: "A",
      orderIndex: 2,
    },
    {
      quizId,
      questionText: "Which vitamin deficiency causes scurvy?",
      optionA: "Vitamin A",
      optionB: "Vitamin B12",
      optionC: "Vitamin C",
      optionD: "Vitamin D",
      correctAnswer: "C",
      orderIndex: 3,
    },
    {
      quizId,
      questionText: "What is the largest organ in the human body?",
      optionA: "Liver",
      optionB: "Brain",
      optionC: "Skin",
      optionD: "Heart",
      correctAnswer: "C",
      orderIndex: 4,
    },
    {
      quizId,
      questionText: "What does MRI stand for?",
      optionA: "Magnetic Resonance Imaging",
      optionB: "Medical Radiology Investigation",
      optionC: "Molecular Research Institute",
      optionD: "Multiple Response Indicator",
      correctAnswer: "A",
      orderIndex: 5,
    },
    {
      quizId,
      questionText: "Which blood type is known as the universal donor?",
      optionA: "A positive",
      optionB: "B negative",
      optionC: "O negative",
      optionD: "AB positive",
      correctAnswer: "C",
      orderIndex: 6,
    },
    {
      quizId,
      questionText: "What is the normal resting heart rate for adults?",
      optionA: "40-60 bpm",
      optionB: "60-100 bpm",
      optionC: "100-120 bpm",
      optionD: "120-140 bpm",
      correctAnswer: "B",
      orderIndex: 7,
    },
    {
      quizId,
      questionText: "Which part of the brain controls balance and coordination?",
      optionA: "Cerebrum",
      optionB: "Cerebellum",
      optionC: "Medulla",
      optionD: "Hypothalamus",
      correctAnswer: "B",
      orderIndex: 8,
    },
    {
      quizId,
      questionText: "What is the medical term for high blood pressure?",
      optionA: "Hypotension",
      optionB: "Hypertension",
      optionC: "Tachycardia",
      optionD: "Bradycardia",
      correctAnswer: "B",
      orderIndex: 9,
    },
    {
      quizId,
      questionText: "How many bones are in the adult human body?",
      optionA: "186",
      optionB: "206",
      optionC: "226",
      optionD: "246",
      correctAnswer: "B",
      orderIndex: 10,
    },
  ];

  await db.insert(questions).values(sampleQuestions);

  // Create rewards
  const rewardsList = [
    {
      title: "Room Facilities Booking Priority",
      description: "Get priority booking for study rooms and facilities",
      creditCost: 50,
      category: "facilities",
      available: true,
    },
    {
      title: "Exam Seating Preference",
      description: "Choose your preferred seat location for exams",
      creditCost: 75,
      category: "exam",
      available: true,
    },
    {
      title: "Extra Quiz Time (10 minutes)",
      description: "Get an additional 10 minutes for your next quiz",
      creditCost: 30,
      category: "quiz",
      available: true,
    },
    {
      title: "Participation Grade Points",
      description: "Earn 2% bonus points towards your participation grade",
      creditCost: 100,
      category: "grades",
      available: true,
    },
    {
      title: "SkillsFuture Credit ($50)",
      description: "Redeem $50 SkillsFuture credits for courses",
      creditCost: 200,
      category: "voucher",
      available: true,
    },
    {
      title: "CDC Voucher ($10)",
      description: "Get $10 CDC voucher for local spending",
      creditCost: 150,
      category: "voucher",
      available: true,
    },
    {
      title: "Free Parking (1 Day)",
      description: "Free parking in campus for one full day",
      creditCost: 80,
      category: "parking",
      available: true,
    },
    {
      title: "Culture Pass Credit ($20)",
      description: "Redeem $20 for cultural activities and events",
      creditCost: 120,
      category: "voucher",
      available: true,
    },
  ];

  await db.insert(rewards).values(rewardsList);

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
