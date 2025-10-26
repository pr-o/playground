import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { z } from 'zod';

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        user: z.string(),
      }),
    )
    .query((opts) => {
      return { greeting: `hello, ${opts.input.user}` };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
