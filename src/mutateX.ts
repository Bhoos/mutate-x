import { Controller } from "./Controller.ts";
import { createProxy } from "./createProxy.ts";

export function createState<T extends {}>(state: T) {
  if (process.env.NODE_ENV !== 'production') {
    if (Array.isArray(state)) throw new Error('State must be a standard object');
  }

  const controller = new Controller();
  return createProxy(state, controller);
}

export const createMutateX = createState;
