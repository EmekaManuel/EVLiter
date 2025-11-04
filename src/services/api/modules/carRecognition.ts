import api from "@/services/apiClient";

// Types
export type RecognizeCarByVINPayload = {
  vin: string;
};

export type RecognizeCarByModelPayload = {
  make: string;
  model: string;
  year: number;
};

export type CarRecognitionResponse = {
  vin?: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  bodyStyle?: string | null;
  drivetrain?: string | null;
  engine?: string | null;
  battery?: string | null;
  imageUrl?: string | null;
  connectorTypes?: string[];
  charging?: {
    capacityKWh?: number | null;
    acMaxKw?: number | null;
    dcMaxKw?: number | null;
    onboardChargerKw?: number | null;
    chargePortLocation?: string | null;
  };
  confidence: number;
  sources?: string[];
};

export type CarRecognitionHistory = CarRecognitionResponse & {
  id: string;
  createdAt: string;
  method?: "vin" | "model";
};

export type GetUserRecognitionsParams = {
  limit?: number;
  offset?: number;
};

export type GetUserRecognitionsResponse = {
  recognitions: CarRecognitionHistory[];
  count: number;
};

// API Functions
export async function recognizeCarByVIN(
  payload: RecognizeCarByVINPayload
): Promise<CarRecognitionResponse> {
  const { data } = await api.post<CarRecognitionResponse>(
    "/ai/car-recognition/vin",
    payload
  );
  return data;
}

export async function recognizeCarByModel(
  payload: RecognizeCarByModelPayload
): Promise<CarRecognitionResponse> {
  const { data } = await api.post<CarRecognitionResponse>(
    "/ai/car-recognition/model",
    payload
  );
  return data;
}

/**
 * Get user's recognition history
 */
export async function getUserRecognitions(
  params?: GetUserRecognitionsParams
): Promise<GetUserRecognitionsResponse> {
  const { data } = await api.get<GetUserRecognitionsResponse>(
    "/ai/car-recognition",
    { params }
  );
  return data;
}

// Optional: Create a combined service object
export const carRecognitionService = {
  recognizeByVIN: recognizeCarByVIN,
  recognizeByModel: recognizeCarByModel,
  getUserRecognitions,
};
