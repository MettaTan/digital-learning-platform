import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

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

  quiz: router({
    list: publicProcedure.query(async () => {
      return await db.getAllQuizzes();
    }),

    getById: publicProcedure
      .input(z.object({ quizId: z.number() }))
      .query(async ({ input }) => {
        const quiz = await db.getQuizById(input.quizId);
        if (!quiz) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Quiz not found" });
        }
        return quiz;
      }),

    getQuestions: publicProcedure
      .input(z.object({ quizId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuestionsByQuizId(input.quizId);
      }),

    checkCompleted: protectedProcedure
      .input(z.object({ quizId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.hasUserCompletedQuiz(ctx.user.id, input.quizId);
      }),

    submitQuiz: protectedProcedure
      .input(
        z.object({
          quizId: z.number(),
          answers: z.array(
            z.object({
              questionId: z.number(),
              selectedAnswer: z.enum(["A", "B", "C", "D"]),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const hasCompleted = await db.hasUserCompletedQuiz(ctx.user.id, input.quizId);
        if (hasCompleted) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You have already completed this quiz",
          });
        }

        const quiz = await db.getQuizById(input.quizId);
        if (!quiz) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Quiz not found" });
        }

        const questions = await db.getQuestionsByQuizId(input.quizId);
        const attemptId = await db.createQuizAttempt({
          userId: ctx.user.id,
          quizId: input.quizId,
          score: 0,
          totalQuestions: questions.length,
          completed: false,
          creditsEarned: 0,
        });

        let correctCount = 0;
        const results = [];

        for (const answer of input.answers) {
          const question = questions.find((q) => q.id === answer.questionId);
          if (!question) continue;

          const isCorrect = question.correctAnswer === answer.selectedAnswer;
          if (isCorrect) correctCount++;

          await db.saveUserAnswer({
            attemptId,
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
          });

          results.push({
            questionId: answer.questionId,
            isCorrect,
            correctAnswer: question.correctAnswer,
          });
        }

        const creditsEarned = Math.floor((correctCount / questions.length) * quiz.creditsReward);
        await db.updateQuizAttempt(attemptId, correctCount, creditsEarned);
        await db.updateUserCredits(ctx.user.id, creditsEarned);
        await db.addCreditTransaction({
          userId: ctx.user.id,
          amount: creditsEarned,
          type: "earned",
          description: `Completed quiz: ${quiz.title}`,
          relatedId: attemptId,
        });

        return {
          score: correctCount,
          totalQuestions: questions.length,
          creditsEarned,
          results,
        };
      }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserQuizHistory(ctx.user.id);
    }),

    resetAttempt: protectedProcedure
      .input(z.object({ quizId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Only allow admins to reset attempts
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can reset quiz attempts",
          });
        }
        await db.deleteQuizAttempt(ctx.user.id, input.quizId);
        return { success: true };
      }),
  }),

  rewards: router({
    list: publicProcedure.query(async () => {
      return await db.getAllRewards();
    }),

    redeem: protectedProcedure
      .input(z.object({ rewardId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const reward = await db.getRewardById(input.rewardId);
        if (!reward) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Reward not found" });
        }

        const user = await db.getUserByOpenId(ctx.user.openId);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        if (user.totalCredits < reward.creditCost) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient credits",
          });
        }

        const redemptionId = await db.createRedemption({
          userId: user.id,
          rewardId: reward.id,
          creditsSpent: reward.creditCost,
          status: "pending",
        });

        await db.updateUserCredits(user.id, -reward.creditCost);
        await db.addCreditTransaction({
          userId: user.id,
          amount: -reward.creditCost,
          type: "spent",
          description: `Redeemed: ${reward.title}`,
          relatedId: redemptionId,
        });

        return { success: true, redemptionId };
      }),

    getRedemptions: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserRedemptions(ctx.user.id);
    }),

    getTransactions: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserTransactions(ctx.user.id);
    }),
  }),

  leaderboard: router({
    get: publicProcedure
      .input(z.object({ limit: z.number().optional().default(10) }))
      .query(async ({ input }) => {
        return await db.getLeaderboard(input.limit);
      }),
  }),

  courses: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCourses();
    }),

    getById: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        const course = await db.getCourseById(input.courseId);
        if (!course) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
        }
        return course;
      }),

    getModules: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCourseModules(input.courseId);
      }),

    enroll: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const enrollmentId = await db.enrollUserInCourse(ctx.user.id, input.courseId);
        return { success: true, enrollmentId };
      }),

    getEnrollments: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserEnrollments(ctx.user.id);
    }),

    completeModule: protectedProcedure
      .input(z.object({ moduleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.completeModule(ctx.user.id, input.moduleId);
        return { success: true };
      }),

    getModuleCompletions: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserModuleCompletions(ctx.user.id, input.courseId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
