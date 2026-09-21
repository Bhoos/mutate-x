import { useState, useEffect } from 'react';
import type { KeysToObject } from './types.ts';
import { getVersion, listen } from './createProxy.ts';

export function useMutateX<T extends {}>(state: T): T
export function useMutateX<T extends {}, Keys extends readonly (keyof T)[]>(
  state: T,
  deps: Keys
): KeysToObject<T, Keys>
export function useMutateX<T extends {}, Keys extends readonly (keyof T)[]>(
  state: T,
  deps?: Keys
) {
  return deps ? useMutateXWithDeps(state, deps) : useMutateXWithoutDeps(state);
}

function useMutateXWithDeps<T extends {}, Keys extends readonly (keyof T)[]>(
  state: T,
  deps: Keys
): KeysToObject<T, Keys> {
  const [result, setResult] = useState(() => {
    return deps.reduce((res, key) => {
      // @ts-ignore
      res[key] = state[key];
      return res;
    }, {} as KeysToObject<T, Keys>)
  });

  useEffect(() => {
    const prev = deps.reduce((res, key) => {
      const value = state[key];
      if (typeof value === 'object' && value) {
        res[key] = getVersion(value);
      } else {
        res[key] = value;
      }
      return res;
    }, {} as Record<keyof T, any>);

    function handler() {
      let changed = false;
      const res = deps.reduce((res, key) => {
        const value = state[key];
        res[key] = value;
        let checkValue: any = value;
        if (typeof value === 'object' && value) {
          checkValue = getVersion(value);
        }
        if (checkValue !== prev[key]) changed = true;
        prev[key] = checkValue;
        return res;
      }, {} as Record<keyof T, any>);

      if (changed) {
        setResult(res);
      }
    }

    return listen(state, handler);
  }, deps);

  return result;
}

function useMutateXWithoutDeps<T extends {}>(state: T) {
  const [_, setVersion] = useState(() => getVersion(state));

  useEffect(() => {
    function handler() {
      setVersion(getVersion(state));
    }

    return listen(state, handler);
  }, []);

  return state;
}
