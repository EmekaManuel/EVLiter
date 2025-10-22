import { type StateCreator, type StoreApi, create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Generic factory to create an app store with immer, devtools and optional persistence
export function createAppStore<TState extends object>(
  initializer: StateCreator<TState, [["zustand/immer", never]], [], TState>,
  options?: {
    name?: string;
    persist?: boolean;
    persistKey?: string;
    version?: number;
  }
) {
  const { name, persist: shouldPersist, persistKey, version } = options || {};

  // Start with immer middleware
  let withMiddleware = immer(initializer);

  if (shouldPersist) {
    // Apply persist middleware - note the type includes the persist mutator
    withMiddleware = persist(withMiddleware, {
      name: persistKey || (name ? `${name}-store` : "app-store"),
      version: version ?? 1,
      storage: createJSONStorage<TState>(() => localStorage),
      // Only persist plain JSON state (omit functions)
      partialize: (state: object) => {
        const clone: Record<string, unknown> = {};
        Object.keys(state as object).forEach((key) => {
          const value = (state as Record<string, unknown>)[key];
          if (typeof value !== "function") clone[key] = value;
        });
        return clone as TState;
      },
    }) as typeof withMiddleware;
  }

  // Apply devtools as the outermost middleware
  const enhanced = devtools(withMiddleware, { name });

  return create<TState>()(enhanced);
}

export type ExtractState<TStore> = TStore extends StoreApi<infer T> ? T : never;
