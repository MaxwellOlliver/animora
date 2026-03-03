import { Effect } from 'effect';

import { UnknownPatternError } from '../../errors/unknown-pattern.error';

type RouteHandler<E, R> = (data: unknown) => Effect.Effect<void, E, R>;

export const createRouter =
  <E, R>(routes: Record<string, RouteHandler<E, R>>) =>
  (
    pattern: string,
    data: unknown,
  ): Effect.Effect<void, E | UnknownPatternError, R> => {
    const handler = routes[pattern];
    if (!handler) return Effect.fail(new UnknownPatternError({ pattern }));
    return handler(data);
  };
