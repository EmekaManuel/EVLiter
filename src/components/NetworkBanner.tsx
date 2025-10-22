import { uiStore } from "@/store";

export default function NetworkBanner() {
  const isOffline = uiStore((s) => s.isOffline);
  if (!isOffline) return null;
  return (
    <div className="w-full bg-red-100 text-yellow-900 text-sm px-4 py-3 text-center">
      You are offline. Some actions may not work. We’ll retry when you’re back
      online.
    </div>
  );
}
