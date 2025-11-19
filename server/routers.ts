import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { quizAttempts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Simple user management (name-based login)
  simpleAuth: router({
    login: publicProcedure
      .input(z.object({ name: z.string().min(1).max(255) }))
      .mutation(async ({ input }) => {
        const user = await db.createOrGetSimpleUser(input.name);
        return user;
      }),
    
    getUser: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSimpleUserById(input.id);
      }),
  }),

  // Quiz operations
  quiz: router({
    // Initialize database with sample questions
    seedQuestions: publicProcedure.mutation(async () => {
      await db.seedQuizQuestions();
      return { success: true };
    }),

    // Get random quiz questions
    getQuestions: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        const questions = await db.getRandomQuizQuestions(input.limit);
        // Return questions without correct answers for security
        return questions.map(q => ({
          id: q.id,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          difficulty: q.difficulty,
          category: q.category,
        }));
      }),

    // Submit quiz attempt
    submitAttempt: publicProcedure
      .input(z.object({
        userId: z.number(),
        answers: z.array(z.object({
          questionId: z.number(),
          userAnswer: z.enum(["A", "B", "C", "D"]),
        })),
      }))
      .mutation(async ({ input }) => {
        // Validate answers and calculate score
        let score = 0;
        const totalQuestions = input.answers.length;
        const feedback: Array<{
          questionId: number;
          question: string;
          userAnswer: string;
          correctAnswer: string;
          isCorrect: boolean;
        }> = [];

        // Create quiz attempt
        const attemptId = await db.createQuizAttempt({
          userId: input.userId,
          score: 0, // Will update after calculating
          totalQuestions,
        });

        // Process each answer
        for (const answer of input.answers) {
          const question = await db.getQuestionById(answer.questionId);
          if (!question) continue;

          const isCorrect = answer.userAnswer === question.correctAnswer;
          if (isCorrect) score++;

          // Save answer
          await db.saveQuizAnswer({
            attemptId,
            questionId: answer.questionId,
            userAnswer: answer.userAnswer,
            isCorrect: isCorrect ? 1 : 0,
          });

          // Add to feedback
          feedback.push({
            questionId: answer.questionId,
            question: question.question,
            userAnswer: answer.userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect,
          });
        }

        // Update attempt with final score
        const db_instance = await db.getDb();
        if (db_instance) {
          await db_instance
            .update(quizAttempts)
            .set({ score })
            .where(eq(quizAttempts.id, attemptId));
        }

        // Award credits based on performance
        const creditsEarned = Math.floor(score * 10); // 10 credits per correct answer
        const user = await db.getSimpleUserById(input.userId);
        if (user) {
          await db.updateUserCredits(input.userId, user.credits + creditsEarned);
        }

        return {
          attemptId,
          score,
          totalQuestions,
          creditsEarned,
          feedback,
        };
      }),

    // Get user's quiz history
    getUserAttempts: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserAttempts(input.userId);
      }),
  }),

  // Leaderboard operations
  leaderboard: router({
    getTop: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await db.getLeaderboard(input.limit);
      }),
  }),

  // Rewards operations
  rewards: router({
    // Get all available rewards
    getAll: publicProcedure.query(async () => {
      return await db.getAllRewards();
    }),

    // Get reward by ID
    getById: publicProcedure
      .input(z.object({ rewardId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRewardById(input.rewardId);
      }),

    // Redeem a reward
    redeem: publicProcedure
      .input(z.object({
        userId: z.number(),
        rewardId: z.number(),
        creditsCost: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.redeemReward(input.userId, input.rewardId, input.creditsCost);
      }),

    // Get user's redemption history
    getUserRedemptions: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserRedemptions(input.userId);
      }),
  }),

  // Video Learning operations
  video: router({
    // Get all video modules
    getAll: publicProcedure.query(async () => {
      return await db.getAllVideoModules();
    }),

    // Get video by ID
    getById: publicProcedure
      .input(z.object({ videoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getVideoModuleById(input.videoId);
      }),

    // Get quiz questions for a video
    getQuizQuestions: publicProcedure
      .input(z.object({ videoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getVideoQuizQuestions(input.videoId);
      }),

    // Get user's progress for a video
    getProgress: publicProcedure
      .input(z.object({ userId: z.number(), videoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getVideoProgress(input.userId, input.videoId);
      }),

    // Save video progress
    saveProgress: publicProcedure
      .input(z.object({
        userId: z.number(),
        videoId: z.number(),
        currentTime: z.number(),
        completed: z.number(),
        quizScore: z.number().optional(),
        totalQuizQuestions: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.saveVideoProgress(input);
      }),

    // Submit quiz answer
    submitAnswer: publicProcedure
      .input(z.object({
        userId: z.number(),
        videoId: z.number(),
        questionId: z.number(),
        userAnswer: z.enum(["A", "B", "C", "D"]),
        isCorrect: z.number(),
        attemptCount: z.number(),
      }))
      .mutation(async ({ input }) => {
        const answerId = await db.saveVideoQuizAnswer(input);
        
        // Award credits for correct answer
        if (input.isCorrect) {
          const user = await db.getSimpleUserById(input.userId);
          if (user) {
            await db.updateUserCredits(input.userId, user.credits + 5);
          }
        }
        
        return { answerId };
      }),
  }),

  // AI Practice operations
  aiPractice: router({
    // Get user's case scenarios
    getUserScenarios: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserCaseScenarios(input.userId);
      }),

    // Get scenario by ID
    getScenarioById: publicProcedure
      .input(z.object({ scenarioId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCaseScenarioById(input.scenarioId);
      }),

    // Get scenario conversations
    getConversations: publicProcedure
      .input(z.object({ scenarioId: z.number() }))
      .query(async ({ input }) => {
        return await db.getScenarioConversations(input.scenarioId);
      }),

    // Create new AI case scenario
    createScenario: publicProcedure
      .input(z.object({
        userId: z.number(),
        category: z.string().optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      }))
      .mutation(async ({ input }) => {
        // Get user's weak areas
        const weakAreas = await db.getUserWeakAreas(input.userId);
        const targetWeakArea = weakAreas.length > 0 ? weakAreas[0].category : undefined;
        
        // Generate AI scenario using LLM
        const { invokeLLM } = await import("./_core/llm");
        
        const prompt = targetWeakArea
          ? `Generate a learning case scenario for practicing "${targetWeakArea}". The scenario should be ${input.difficulty || "medium"} difficulty and present a realistic situation that requires applying knowledge in this area. Format: A brief scenario description (2-3 paragraphs) that sets up a problem or decision point.`
          : `Generate a general learning case scenario for ${input.category || "general knowledge"}. The scenario should be ${input.difficulty || "medium"} difficulty. Format: A brief scenario description (2-3 paragraphs) that sets up a problem or decision point.`;
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an educational content creator specializing in creating realistic case scenarios for learning." },
            { role: "user", content: prompt },
          ],
        });
        
        const scenario = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);
        
        // Save scenario
        const scenarioId = await db.createAICaseScenario({
          userId: input.userId,
          scenario,
          category: input.category,
          difficulty: input.difficulty || "medium",
          targetWeakArea,
          completed: 0,
        });
        
        return { scenarioId, scenario };
      }),

    // Send message in AI practice conversation
    sendMessage: publicProcedure
      .input(z.object({
        scenarioId: z.number(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Get scenario and conversation history
        const scenario = await db.getCaseScenarioById(input.scenarioId);
        if (!scenario) throw new Error("Scenario not found");
        
        const conversations = await db.getScenarioConversations(input.scenarioId);
        
        // Save user message
        await db.saveAIConversation({
          scenarioId: input.scenarioId,
          role: "user",
          message: input.message,
        });
        
        // Generate AI response
        const { invokeLLM } = await import("./_core/llm");
        
        const messages = [
          {
            role: "system" as const,
            content: `You are an AI tutor helping a student practice their skills through case scenarios. The current scenario is:\n\n${scenario.scenario}\n\nProvide helpful guidance, ask probing questions, and give feedback on the student's responses. Be encouraging but also point out areas for improvement.`,
          },
          ...conversations.map((c) => ({
            role: c.role as "user" | "assistant",
            content: c.message,
          })),
          { role: "user" as const, content: input.message },
        ];
        
        const response = await invokeLLM({ messages });
        const aiMessage = typeof response.choices[0].message.content === 'string'
          ? response.choices[0].message.content
          : JSON.stringify(response.choices[0].message.content);
        
        // Save AI response
        await db.saveAIConversation({
          scenarioId: input.scenarioId,
          role: "assistant",
          message: aiMessage,
        });
        
        return { message: aiMessage };
      }),

    // Complete scenario
    completeScenario: publicProcedure
      .input(z.object({
        scenarioId: z.number(),
        score: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateCaseScenarioCompletion(input.scenarioId, input.score);
        
        // Award credits
        const scenario = await db.getCaseScenarioById(input.scenarioId);
        if (scenario) {
          const user = await db.getSimpleUserById(scenario.userId);
          if (user) {
            const creditsEarned = Math.floor(input.score * 2); // 2 credits per score point
            await db.updateUserCredits(scenario.userId, user.credits + creditsEarned);
            return { creditsEarned };
          }
        }
        return { creditsEarned: 0 };
      }),

    // Get user's weak areas
    getWeakAreas: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserWeakAreas(input.userId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
