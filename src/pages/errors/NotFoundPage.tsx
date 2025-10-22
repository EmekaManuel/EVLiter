import { Link } from "react-router-dom";
import NotFoundSvg from "@/assets/404.svg";

export default function NotFoundPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-8">
      <img
        src={NotFoundSvg}
        alt="404 Not Found"
        className="w-[500px] h-[500px] mb-6"
      />
      <p className="text-gray-600 mb-6">
        The page you are looking for doesn't exist.
      </p>
      <div className="flex gap-3">
        <Link
          to="/dashboard/company"
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Go to Dashboard
        </Link>
        <Link to="/auth/sign-in" className="px-4 py-2 border rounded-md">
          Sign In
        </Link>
      </div>
    </div>
  );
}
