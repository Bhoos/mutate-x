import type { Context } from "./types.ts";

export class Controller {
  private readonly contexts = new WeakMap<object, Context>();

  /**
   * Keep track of all the handlers, mapped by the object they are
   * listening to.
   */
  private readonly listeners = new Map<object, Array<() => void>>();

  /**
   * List of objects that need to be fired, at the end of the event loop.
   * This is used for firing handlers on batch.
   */
  private readonly triggers = new Set<object>();

  /**
   * Trigger all the handlers at the end of the event loop
   */
  private trigger = () => {
    for (const trigger of this.triggers) {
      const list = this.listeners.get(trigger);
      if (list) {
        list.forEach((l) => l());
      }
    }
    this.triggers.clear();
  };

  getContext(obj: object): Context {
    let ctx = this.contexts.get(obj);
    if (!ctx) {
      ctx = { version: 1 };
    }
    this.contexts.set(obj, ctx);
    return ctx;
  }

  fire(trigger: object) {
    // if there aren't any listeners for the given trigger this is a noop
    if (!this.listeners.has(trigger)) return;


    if (this.triggers.size === 0) {
      queueMicrotask(this.trigger);
    }
    this.triggers.add(trigger);
  }

  /**
   * Listen on the specific object
   *
   * @param trigger
   * @param handler
   * @returns
   */
  listen(trigger: object, handler: () => void) {

    let list = this.listeners.get(trigger);
    if (!list) {
      list = [];
      this.listeners.set(trigger, list);
    }
    list.push(handler);


    /**
     * the unlisten method
     */
    return () => {
      const list = this.listeners.get(trigger);
      if (list) {
        const idx = list.indexOf(handler);
        if (idx >= 0) {
          list.splice(idx, 1);
          if (list.length === 0) this.listeners.delete(trigger);
        }
      }
    };
  }
}
