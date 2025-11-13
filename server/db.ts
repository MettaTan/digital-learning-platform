import { eq, desc, sql, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  quizzes, 
  questions, 
  quizAttempts, 
  userAnswers, 
  rewards, 
  redemptions, 
  creditTransactions,
  InsertQuizAttempt,
  InsertUserAnswer,
  InsertCreditTransaction,
  InsertRedemption
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// Quiz functions
export async function getAllQuizzes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quizzes);
}

export async function getQuizById(quizId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuestionsByQuizId(quizId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(questions).where(eq(questions.quizId, quizId));
}

export async function hasUserCompletedQuiz(userId: number, quizId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(quizAttempts)
    .where(sql`${quizAttempts.userId} = ${userId} AND ${quizAttempts.quizId} = ${quizId} AND ${quizAttempts.completed} = true`)
    .limit(1);
  return result.length > 0;
}

export async function createQuizAttempt(attempt: InsertQuizAttempt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quizAttempts).values(attempt);
  return result[0].insertId;
}

export async function saveUserAnswer(answer: InsertUserAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userAnswers).values(answer);
}

export async function updateQuizAttempt(attemptId: number, score: number, creditsEarned: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(quizAttempts)
    .set({ score, creditsEarned, completed: true })
    .where(eq(quizAttempts.id, attemptId));
}

export async function updateUserCredits(userId: number, creditsToAdd: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(users)
    .set({ totalCredits: sql`${users.totalCredits} + ${creditsToAdd}` })
    .where(eq(users.id, userId));
}

export async function addCreditTransaction(transaction: InsertCreditTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(creditTransactions).values(transaction);
}

// Rewards functions
export async function getAllRewards() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(rewards).where(eq(rewards.available, true));
}

export async function getRewardById(rewardId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(rewards).where(eq(rewards.id, rewardId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createRedemption(redemption: InsertRedemption) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(redemptions).values(redemption);
  return result[0].insertId;
}

export async function getUserRedemptions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(redemptions)
    .where(eq(redemptions.userId, userId))
    .orderBy(desc(redemptions.createdAt));
}

export async function getUserTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt));
}

export async function getLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: users.id,
      name: users.name,
      totalCredits: users.totalCredits,
    })
    .from(users)
    .orderBy(desc(users.totalCredits))
    .limit(limit);
}

export async function getUserQuizHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, userId))
    .orderBy(desc(quizAttempts.createdAt));
}

export async function deleteQuizAttempt(userId: number, quizId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get all attempt IDs for this user and quiz
  const attempts = await db
    .select({ id: quizAttempts.id })
    .from(quizAttempts)
    .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)));
  
  if (attempts.length === 0) return;
  
  const attemptIds = attempts.map(a => a.id);
  
  // Delete user answers for these attempts
  await db.delete(userAnswers).where(
    sql`${userAnswers.attemptId} IN (${sql.join(attemptIds.map(id => sql`${id}`), sql`, `)})`
  );
  
  // Delete the attempts
  await db.delete(quizAttempts).where(
    and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId))
  );
}

// Course functions
export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  const { courses } = await import("../drizzle/schema");
  return await db.select().from(courses);
}

export async function getCourseById(courseId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { courses } = await import("../drizzle/schema");
  const result = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCourseModules(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  const { courseModules } = await import("../drizzle/schema");
  return await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId))
    .orderBy(courseModules.orderIndex);
}

export async function getUserCourseEnrollment(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { courseEnrollments } = await import("../drizzle/schema");
  const result = await db
    .select()
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function enrollUserInCourse(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { courseEnrollments } = await import("../drizzle/schema");
  
  // Check if already enrolled
  const existing = await getUserCourseEnrollment(userId, courseId);
  if (existing) return existing.id;
  
  const result = await db.insert(courseEnrollments).values({
    userId,
    courseId,
    progress: 0,
  });
  return result[0].insertId;
}

export async function getUserEnrollments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { courseEnrollments, courses } = await import("../drizzle/schema");
  
  const result = await db
    .select({
      enrollment: courseEnrollments,
      course: courses,
    })
    .from(courseEnrollments)
    .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .where(eq(courseEnrollments.userId, userId))
    .orderBy(desc(courseEnrollments.lastAccessedAt));
    
  return result.map(r => ({
    ...r.enrollment,
    course: r.course,
  }));
}

export async function completeModule(userId: number, moduleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { moduleCompletions } = await import("../drizzle/schema");
  
  // Check if already completed
  const existing = await db
    .select()
    .from(moduleCompletions)
    .where(and(eq(moduleCompletions.userId, userId), eq(moduleCompletions.moduleId, moduleId)))
    .limit(1);
    
  if (existing.length > 0) return;
  
  await db.insert(moduleCompletions).values({
    userId,
    moduleId,
    completed: true,
    completedAt: new Date(),
  });
}

export async function getUserModuleCompletions(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) return [];
  const { moduleCompletions, courseModules } = await import("../drizzle/schema");
  
  const result = await db
    .select({
      moduleId: courseModules.id,
      completed: moduleCompletions.completed,
    })
    .from(courseModules)
    .leftJoin(
      moduleCompletions,
      and(
        eq(courseModules.id, moduleCompletions.moduleId),
        eq(moduleCompletions.userId, userId)
      )
    )
    .where(eq(courseModules.courseId, courseId));
    
  return result;
}
