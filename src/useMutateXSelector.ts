import { useState, useEffect } from 'react';
import { type KeysToObject } from './types.ts';
import { getVersion, listen } from './createProxy.ts';

export function useMutateXSelector<T extends {}, Keys extends readonly (keyof T)[], V>(
  state: T,
  deps: Keys,
  selector: (state: T) => V
): V {
  const [result, setResult] = useState(() => selector(state));

  useEffect(() => {
    let prev = deps.reduce((res, key) => {
      let value: any = state[key];
      if (typeof value === 'object' && value) {
        value = getVersion(value);
      }
      res[key] = value;
      return res;
    }, {} as Record<keyof T, any>);

    function handler() {
      const next = {} as Record<keyof T, any>;
      let changed = false;
      for (const key of deps) {
        const newValue = state[key];
        const checkValue = (typeof newValue === 'object' && newValue) ? getVersion(newValue) : newValue;
        if (checkValue !== prev[key]) changed = true;
        prev[key] = checkValue;
        next[key] = newValue;
      }

      if (changed) {
        setResult(selector(next));
      }
    }

    return listen(state, handler);
  }, deps);

  return result;
}
