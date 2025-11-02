import type { CarInfo } from "@/types/ev";
import { createAppStore } from "./createAppStore";

interface CarInfoState {
  carInfo: CarInfo | null;
  setCarInfo: (carInfo: CarInfo | null) => void;
  clearCarInfo: () => void;
}

export const useCarInfoStore = createAppStore<CarInfoState>(
  (set) => ({
    carInfo: null,
    setCarInfo: (carInfo) => {
      set((state) => {
        state.carInfo = carInfo;
      });
    },
    clearCarInfo: () => {
      set((state) => {
        state.carInfo = null;
      });
    },
  }),
  {
    name: "CarInfo",
    persist: true,
    persistKey: "car-info-store",
    version: 1,
  }
);
