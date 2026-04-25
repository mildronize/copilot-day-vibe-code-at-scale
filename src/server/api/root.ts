import { userRouter } from "~/server/api/routers/user";
import { todoRouter } from "~/server/api/routers/todo";
import { expenseRouter } from "~/server/api/routers/expense";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  todo: todoRouter,
  expense: expenseRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.user.getProfile();
 */
export const createCaller = createCallerFactory(appRouter);
