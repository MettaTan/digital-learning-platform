import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  simpleUsers,
  InsertSimpleUser,
  quizQuestions,
  quizAttempts,
  InsertQuizAttempt,
  quizAnswers,
  InsertQuizAnswer,
  InsertQuizQuestion,
  rewardsCatalog,
  rewardRedemptions,
  InsertRewardRedemption,
  videoModules,
  videoQuizQuestions,
  videoProgress,
  InsertVideoProgress,
  videoQuizAnswers,
  InsertVideoQuizAnswer,
  aiCaseScenarios,
  InsertAICaseScenario,
  aiConversations,
  InsertAIConversation,
  userWeakAreas,
  InsertUserWeakArea
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Quiz and Learning Platform Queries

// Simple User Operations
export async function createOrGetSimpleUser(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Try to get existing user
  const existing = await db.select().from(simpleUsers).where(eq(simpleUsers.name, name)).limit(1);
  if (existing.length > 0) return existing[0];

  // Create new user
  const result = await db.insert(simpleUsers).values({ name, credits: 0 });
  const newUser = await db.select().from(simpleUsers).where(eq(simpleUsers.id, Number(result[0].insertId))).limit(1);
  return newUser[0];
}

export async function getSimpleUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(simpleUsers).where(eq(simpleUsers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserCredits(userId: number, credits: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(simpleUsers).set({ credits }).where(eq(simpleUsers.id, userId));
}

// Quiz Questions
export async function getRandomQuizQuestions(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  // Get random questions using ORDER BY RAND()
  const questions = await db.select().from(quizQuestions).orderBy(sql`RAND()`).limit(limit);
  return questions;
}

export async function getQuestionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Quiz Attempts
export async function createQuizAttempt(data: InsertQuizAttempt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quizAttempts).values(data);
  return Number(result[0].insertId);
}

export async function getUserAttempts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.completedAt));
}

// Quiz Answers
export async function saveQuizAnswer(data: InsertQuizAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(quizAnswers).values(data);
}

export async function getAttemptAnswers(attemptId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quizAnswers).where(eq(quizAnswers.attemptId, attemptId));
}

// Leaderboard
export async function getLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  // Get top users by total score across all attempts
  const leaderboard = await db
    .select({
      userId: simpleUsers.id,
      name: simpleUsers.name,
      credits: simpleUsers.credits,
      totalScore: sql<number>`COALESCE(SUM(${quizAttempts.score}), 0)`,
      totalAttempts: sql<number>`COUNT(${quizAttempts.id})`,
      avgScore: sql<number>`COALESCE(AVG(${quizAttempts.score}), 0)`,
    })
    .from(simpleUsers)
    .leftJoin(quizAttempts, eq(simpleUsers.id, quizAttempts.userId))
    .groupBy(simpleUsers.id)
    .orderBy(desc(sql<number>`COALESCE(SUM(${quizAttempts.score}), 0)`))
    .limit(limit);

  return leaderboard;
}

// Seed quiz questions
export async function seedQuizQuestions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if questions already exist
  const existing = await db.select().from(quizQuestions).limit(1);
  if (existing.length > 0) return; // Already seeded

  const questions: InsertQuizQuestion[] = [
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

  await db.insert(quizQuestions).values(questions);
}


// Rewards functions

export async function getAllRewards() {
  const db = await getDb();
  if (!db) return [];
  
  const rewards = await db
    .select()
    .from(rewardsCatalog)
    .where(eq(rewardsCatalog.isActive, 1))
    .orderBy(rewardsCatalog.category, rewardsCatalog.creditCost);
  
  return rewards;
}

export async function getRewardById(rewardId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(rewardsCatalog)
    .where(eq(rewardsCatalog.id, rewardId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function redeemReward(userId: number, rewardId: number, creditsCost: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if user has enough credits
  const userResult = await db
    .select()
    .from(simpleUsers)
    .where(eq(simpleUsers.id, userId))
    .limit(1);
  
  if (userResult.length === 0) {
    throw new Error("User not found");
  }
  
  const user = userResult[0];
  if (user.credits < creditsCost) {
    throw new Error("Insufficient credits");
  }
  
  // Deduct credits from user
  await db
    .update(simpleUsers)
    .set({ credits: user.credits - creditsCost })
    .where(eq(simpleUsers.id, userId));
  
  // Calculate expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  // Create redemption record
  const redemption: InsertRewardRedemption = {
    userId,
    rewardId,
    creditsCost,
    status: "pending",
    expiresAt,
  };
  
  const result = await db.insert(rewardRedemptions).values(redemption);
  
  return {
    success: true,
    redemptionId: result[0].insertId,
    remainingCredits: user.credits - creditsCost,
  };
}

export async function getUserRedemptions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const redemptions = await db
    .select({
      id: rewardRedemptions.id,
      rewardName: rewardsCatalog.name,
      rewardDescription: rewardsCatalog.description,
      category: rewardsCatalog.category,
      icon: rewardsCatalog.icon,
      creditsCost: rewardRedemptions.creditsCost,
      status: rewardRedemptions.status,
      redeemedAt: rewardRedemptions.redeemedAt,
      expiresAt: rewardRedemptions.expiresAt,
      notes: rewardRedemptions.notes,
    })
    .from(rewardRedemptions)
    .leftJoin(rewardsCatalog, eq(rewardRedemptions.rewardId, rewardsCatalog.id))
    .where(eq(rewardRedemptions.userId, userId))
    .orderBy(desc(rewardRedemptions.redeemedAt));
  
  return redemptions;
}


// Video Learning functions

export async function getAllVideoModules() {
  const db = await getDb();
  if (!db) return [];
  
  const videos = await db
    .select()
    .from(videoModules)
    .where(eq(videoModules.isActive, 1))
    .orderBy(videoModules.createdAt);
  
  return videos;
}

export async function getVideoModuleById(videoId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(videoModules)
    .where(eq(videoModules.id, videoId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getVideoQuizQuestions(videoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const questions = await db
    .select()
    .from(videoQuizQuestions)
    .where(eq(videoQuizQuestions.videoId, videoId))
    .orderBy(videoQuizQuestions.pauseTime);
  
  return questions;
}

export async function getVideoProgress(userId: number, videoId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(videoProgress)
    .where(
      sql`${videoProgress.userId} = ${userId} AND ${videoProgress.videoId} = ${videoId}`
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function saveVideoProgress(progress: InsertVideoProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if progress exists
  const existing = await getVideoProgress(progress.userId, progress.videoId);
  
  if (existing) {
    // Update existing progress
    await db
      .update(videoProgress)
      .set({
        currentTime: progress.currentTime,
        completed: progress.completed,
        quizScore: progress.quizScore,
        totalQuizQuestions: progress.totalQuizQuestions,
        lastWatchedAt: new Date(),
      })
      .where(eq(videoProgress.id, existing.id));
    
    return existing.id;
  } else {
    // Create new progress
    const result = await db.insert(videoProgress).values(progress);
    return result[0].insertId;
  }
}

export async function saveVideoQuizAnswer(answer: InsertVideoQuizAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(videoQuizAnswers).values(answer);
  
  // Update video progress quiz score
  const progress = await getVideoProgress(answer.userId, answer.videoId);
  if (progress && answer.isCorrect) {
    await db
      .update(videoProgress)
      .set({
        quizScore: (progress.quizScore || 0) + 1,
        totalQuizQuestions: (progress.totalQuizQuestions || 0) + 1,
      })
      .where(eq(videoProgress.id, progress.id));
  }
  
  return result[0].insertId;
}

// AI Practice functions

export async function createAICaseScenario(scenario: InsertAICaseScenario) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(aiCaseScenarios).values(scenario);
  return result[0].insertId;
}

export async function getUserCaseScenarios(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const scenarios = await db
    .select()
    .from(aiCaseScenarios)
    .where(eq(aiCaseScenarios.userId, userId))
    .orderBy(desc(aiCaseScenarios.createdAt));
  
  return scenarios;
}

export async function getCaseScenarioById(scenarioId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(aiCaseScenarios)
    .where(eq(aiCaseScenarios.id, scenarioId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function saveAIConversation(conversation: InsertAIConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(aiConversations).values(conversation);
  return result[0].insertId;
}

export async function getScenarioConversations(scenarioId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conversations = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.scenarioId, scenarioId))
    .orderBy(aiConversations.createdAt);
  
  return conversations;
}

export async function updateCaseScenarioCompletion(scenarioId: number, score: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(aiCaseScenarios)
    .set({ completed: 1, score })
    .where(eq(aiCaseScenarios.id, scenarioId));
}

export async function getUserWeakAreas(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const weakAreas = await db
    .select()
    .from(userWeakAreas)
    .where(eq(userWeakAreas.userId, userId))
    .orderBy(desc(sql`${userWeakAreas.incorrectCount} / ${userWeakAreas.totalAttempts}`));
  
  return weakAreas;
}

export async function updateUserWeakArea(weakArea: InsertUserWeakArea) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if weak area exists
  const existing = await db
    .select()
    .from(userWeakAreas)
    .where(
      sql`${userWeakAreas.userId} = ${weakArea.userId} AND ${userWeakAreas.category} = ${weakArea.category}`
    )
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing
    await db
      .update(userWeakAreas)
      .set({
        incorrectCount: (existing[0].incorrectCount || 0) + (weakArea.incorrectCount || 0),
        totalAttempts: (existing[0].totalAttempts || 0) + (weakArea.totalAttempts || 0),
        lastPracticedAt: new Date(),
      })
      .where(eq(userWeakAreas.id, existing[0].id));
  } else {
    // Create new
    await db.insert(userWeakAreas).values(weakArea);
  }
}
