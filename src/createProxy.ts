import { Controller } from './Controller.ts';

function getInternal<T extends object>(state: T) {
  // @ts-ignore
  return state["."] as [T, Controller];
}

export function getVersion<T extends object>(state: T) {
  const internal = getInternal(state);
  if (!internal) throw new Error(`Could not retrieve internal state from the proxy::`, state);
  const [source, controller] = internal;
  return controller.getContext(source).version;
}

export function listen<T extends object>(state: T, handler: () => void) {
  const internal = getInternal(state);
  if (!internal) throw new Error(`Could not retrieve internal state from the proxy::`, state);
  const [source, controller] = internal;
  return controller.listen(source, handler);
}

export function createProxy<T extends object>(source: T, controller: Controller) {
  return createProxyInternal(source, controller, null);
}

function createProxyInternal<T extends object>(source: T, controller: Controller, parent: null | object) {
  const context = controller.getContext(source);

  // Keep track of the internal context for using within proxy
  // This is like private property accessible via "." on the proxy
  // const ctx: Context = { controller, source, parent, version: 1 };
  const internal = [source, controller];

  return new Proxy(source, {
    get(target, prop) {
      // Return the internal value
      if (prop === '.') {
        return internal;
      }

      const value = Reflect.get(target, prop);

      // Convert any internal value that is an object (including array) with proxy
      if (typeof value === "object" && value) {
        return createProxyInternal(value, controller, source);
      }
      return value;
    },
    set(target, prop, value) {
      // Check if the value we are trying to set is a Proxy
      // in which case we will extract the underlying object
      if (typeof value === 'object' && value) {
        const internal = getInternal(value);
        if (internal) {
          value = internal[0];
        }
      }

      // early exit in case the value has not changed
      if (value === target[prop as keyof T]) return true;

      // Set the value within the origin object
      const res = Reflect.set(target, prop, value);

      // Update the version for the node
      context.version += 1;

      // in case the target is an array, we hit the parent object,
      // treating array as being changed, let the parent state know of the change
      if (Array.isArray(target)) {
        const p = controller.getContext(parent!);
        p.version += 1;
        controller.fire(parent!);
      } else {
        controller.fire(target);
      }

      return res;
    },
  });
}
