import { useMemo } from "react";
import { type StoreApi, useStore } from "zustand";

// Typed selector hook with shallow comparison to reduce re-renders
export function useShallowSelector<TState, TSlice>(
  store: StoreApi<TState>,
  selector: (state: TState) => TSlice
) {
  return useStore(
    store,
    useMemo(() => selector, [selector])
  );
}
