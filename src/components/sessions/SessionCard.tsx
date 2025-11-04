import {
  MapPin,
  Clock,
  Zap,
  Battery,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import type { ChargingSession } from "@/types/ev";
import { formatDuration, formatDate, formatTime } from "@/utils/formatting";
import { cleanStationName, getStatusColor } from "@/utils/charging";

interface SessionCardProps {
  session: ChargingSession;
  showBatteryGain?: boolean;
}

export function SessionCard({
  session,
  showBatteryGain = false,
}: SessionCardProps) {
  const batteryGain =
    session.batteryLevelStart !== undefined
      ? session.batteryLevel - session.batteryLevelStart
      : null;

  return (
    <div className="p-4 border border-gray-200 rounded-2xl shadow-sm bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">
              {session.station?.name || cleanStationName(session.stationName)}
            </h4>
            <span
              className={`text-xs px-2 py-1 rounded-full border shrink-0 ${getStatusColor(
                session.status
              )} border-current`}
            >
              {session.status}
            </span>
          </div>
          {session.station?.address && (
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{session.station.address}</span>
            </p>
          )}
        </div>
      </div>

      {/* Battery Info */}
      {showBatteryGain && batteryGain !== null && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Start: {session.batteryLevelStart}%
            </span>
            <span className="font-medium text-gray-900">
              {session.batteryLevel}%
            </span>
            <span className="text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />+{batteryGain.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDuration(session.duration)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Power</p>
            <p className="text-sm font-medium text-gray-900">
              {session.averagePower > 0
                ? `${session.averagePower.toFixed(1)} kW`
                : "0.0 kW"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Battery className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Energy</p>
            <p className="text-sm font-medium text-gray-900">
              {session.energyDelivered.toFixed(2)} kWh
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Cost</p>
            <p className="text-sm font-medium text-gray-900">
              ${session.totalCost.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Date/Time */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span>{formatDate(session.startTime)}</span>
        <span>{formatTime(session.startTime)}</span>
      </div>
    </div>
  );
}
