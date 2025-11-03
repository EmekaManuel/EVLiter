import api from "@/services/apiClient";
import type { ChargingSession, UserStats } from "@/types/ev";

// Request/Response types matching the backend schemas
export type StartChargingSessionPayload = {
  stationId: string;
  connectorId: string;
  batteryLevelStart: number;
};

export type EndChargingSessionPayload = {
  sessionId: string;
  batteryLevelEnd?: number;
  stationRating?: number;
};

export type UpdateActiveSessionPayload = {
  batteryLevel: number;
  energyDelivered?: number;
};

export type GetSessionsParams = {
  filter?: "recent" | "this-month" | "all-time";
  limit?: string;
  offset?: number;
};

export type ChargingSessionResponse = ChargingSession & {
  batteryLevelStart?: number;
  endTime?: string;
};

export type UserStatsResponse = UserStats & {
  monthlyUsage: Array<{
    month: string;
    sessions: number;
    energyUsed: number;
    totalSpent: number;
  }>;
};

export type DashboardResponse = {
  sessions: ChargingSessionResponse[];
  stats: UserStatsResponse;
  activeSession: ChargingSessionResponse | null;
};

/**
 * Get user's charging sessions with optional filters
 */
export async function getSessions(params?: GetSessionsParams) {
  const { data } = await api.get<{ sessions: ChargingSessionResponse[] }>(
    "/charging/sessions",
    { params }
  );
  return data.sessions;
}

/**
 * Get user's active charging session
 */
export async function getActiveSession() {
  const { data } = await api.get<{ session: ChargingSessionResponse | null }>(
    "/charging/sessions/active"
  );
  return data.session;
}

/**
 * Get user's charging statistics
 */
export async function getUserStats() {
  const { data } = await api.get<UserStatsResponse>("/charging/stats");
  return data;
}

/**
 * Start a new charging session
 */
export async function startChargingSession(
  payload: StartChargingSessionPayload
) {
  const { data } = await api.post<{ session: ChargingSessionResponse }>(
    "/charging/sessions/start",
    payload
  );
  return data.session;
}

/**
 * End/stop a charging session
 */
export async function endChargingSession(payload: EndChargingSessionPayload) {
  const { data } = await api.post<{ session: ChargingSessionResponse }>(
    "/charging/sessions/end",
    payload
  );
  return data.session;
}

/**
 * Update active session (for real-time battery level, energy delivered, etc.)
 */
export async function updateActiveSession(payload: UpdateActiveSessionPayload) {
  const { data } = await api.put<{ session: ChargingSessionResponse }>(
    "/charging/sessions/active/update",
    payload
  );
  return data.session;
}

/**
 * Get all dashboard data (sessions, stats, active session) in one call
 */
export async function getDashboard() {
  const { data } = await api.get<DashboardResponse>("/charging/dashboard");
  return data;
}
