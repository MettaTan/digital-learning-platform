import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Quiz and Learning Platform Tables

/**
 * Simple users table for name-based login (no authentication)
 * Tracks user names for leaderboard display
 */
export const simpleUsers = mysqlTable("simple_users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  credits: int("credits").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SimpleUser = typeof simpleUsers.$inferSelect;
export type InsertSimpleUser = typeof simpleUsers.$inferInsert;

/**
 * Quiz questions table
 */
export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  question: text("question").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC").notNull(),
  optionD: text("optionD").notNull(),
  correctAnswer: mysqlEnum("correctAnswer", ["A", "B", "C", "D"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;

/**
 * Quiz attempts table - tracks user quiz sessions
 */
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => simpleUsers.id),
  score: int("score").notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

/**
 * Quiz answers table - tracks individual question responses
 */
export const quizAnswers = mysqlTable("quiz_answers", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull().references(() => quizAttempts.id),
  questionId: int("questionId").notNull().references(() => quizQuestions.id),
  userAnswer: mysqlEnum("userAnswer", ["A", "B", "C", "D"]).notNull(),
  isCorrect: int("isCorrect").notNull(), // 1 for true, 0 for false
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
});

export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type InsertQuizAnswer = typeof quizAnswers.$inferInsert;
/**
 * Rewards catalog table - available rewards that users can redeem
 */
export const rewardsCatalog = mysqlTable("rewards_catalog", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", [
    "parking",
    "exam_seating",
    "facilities_booking",
    "quiz_time",
    "participation_points",
    "skillsfuture",
    "culturepass",
    "cdc_voucher",
  ]).notNull(),
  creditCost: int("creditCost").notNull(),
  icon: varchar("icon", { length: 50 }), // lucide icon name
  isActive: int("isActive").default(1).notNull(), // 1 for active, 0 for inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RewardCatalog = typeof rewardsCatalog.$inferSelect;
export type InsertRewardCatalog = typeof rewardsCatalog.$inferInsert;

/**
 * Reward redemptions table - tracks user reward claims
 */
export const rewardRedemptions = mysqlTable("reward_redemptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => simpleUsers.id),
  rewardId: int("rewardId").notNull().references(() => rewardsCatalog.id),
  creditsCost: int("creditsCost").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "completed", "cancelled", "expired"]).default("pending").notNull(),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // When the reward expires
  notes: text("notes"),
});

export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
export type InsertRewardRedemption = typeof rewardRedemptions.$inferInsert;

/**
 * Interactive video modules table
 */
export const videoModules = mysqlTable("video_modules", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: text("videoUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  duration: int("duration"), // in seconds
  category: varchar("category", { length: 100 }),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoModule = typeof videoModules.$inferSelect;
export type InsertVideoModule = typeof videoModules.$inferInsert;

/**
 * Video quiz questions - appear during video playback
 */
export const videoQuizQuestions = mysqlTable("video_quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull().references(() => videoModules.id),
  pauseTime: int("pauseTime").notNull(), // timestamp in seconds when to pause video
  question: text("question").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC"),
  optionD: text("optionD"),
  correctAnswer: mysqlEnum("correctAnswer", ["A", "B", "C", "D"]).notNull(),
  incorrectFeedback: text("incorrectFeedback").notNull(), // What happens if wrong
  correctFeedback: text("correctFeedback"), // Optional feedback for correct answer
  hintText: text("hintText"), // Hint shown after incorrect answer
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoQuizQuestion = typeof videoQuizQuestions.$inferSelect;
export type InsertVideoQuizQuestion = typeof videoQuizQuestions.$inferInsert;

/**
 * User video progress tracking
 */
export const videoProgress = mysqlTable("video_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => simpleUsers.id),
  videoId: int("videoId").notNull().references(() => videoModules.id),
  currentTime: int("currentTime").default(0).notNull(), // last watched position in seconds
  completed: int("completed").default(0).notNull(), // 1 if completed, 0 otherwise
  quizScore: int("quizScore").default(0), // number of correct answers
  totalQuizQuestions: int("totalQuizQuestions").default(0),
  lastWatchedAt: timestamp("lastWatchedAt").defaultNow().notNull(),
});

export type VideoProgress = typeof videoProgress.$inferSelect;
export type InsertVideoProgress = typeof videoProgress.$inferInsert;

/**
 * User video quiz answers
 */
export const videoQuizAnswers = mysqlTable("video_quiz_answers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => simpleUsers.id),
  videoId: int("videoId").notNull().references(() => videoModules.id),
  questionId: int("questionId").notNull().references(() => videoQuizQuestions.id),
  userAnswer: mysqlEnum("userAnswer", ["A", "B", "C", "D"]).notNull(),
  isCorrect: int("isCorrect").notNull(),
  attemptCount: int("attemptCount").default(1).notNull(), // how many tries
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
});

export type VideoQuizAnswer = typeof videoQuizAnswers.$inferSelect;
export type InsertVideoQuizAnswer = typeof videoQuizAnswers.$inferInsert;

/**
 * AI practice case scenarios
 */
export const aiCaseScenarios = mysqlTable("ai_case_scenarios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => simpleUsers.id),
  scenario: text("scenario").notNull(), // AI-generated case description
  category: varchar("category", { length: 100 }),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  targetWeakArea: varchar("targetWeakArea", { length: 255 }), // what this is practicing
  completed: int("completed").default(0).notNull(),
  score: int("score"), // performance score
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AICaseScenario = typeof aiCaseScenarios.$inferSelect;
export type InsertAICaseScenario = typeof aiCaseScenarios.$inferInsert;

/**
 * AI practice conversation history
 */
export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  scenarioId: int("scenarioId").notNull().references(() => aiCaseScenarios.id),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = typeof aiConversations.$inferInsert;

/**
 * User weak areas tracking for personalized AI practice
 */
export const userWeakAreas = mysqlTable("user_weak_areas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => simpleUsers.id),
  category: varchar("category", { length: 100 }).notNull(),
  incorrectCount: int("incorrectCount").default(0).notNull(),
  totalAttempts: int("totalAttempts").default(0).notNull(),
  lastPracticedAt: timestamp("lastPracticedAt").defaultNow().notNull(),
});

export type UserWeakArea = typeof userWeakAreas.$inferSelect;
export type InsertUserWeakArea = typeof userWeakAreas.$inferInsert;
