import { Link } from "react-router-dom";

export default function ServerErrorPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-2">Something went wrong</h1>
      <p className="text-gray-600 mb-6">
        An unexpected server error occurred. Please try again.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Reload
        </button>
        <Link to="/dashboard/home" className="px-4 py-2 border rounded-md">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
