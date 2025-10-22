import { Link } from "react-router-dom";
import UnauthorizedSvg from "@/assets/401.svg";

const UnauthorizedPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <img
        src={UnauthorizedSvg}
        alt="401 Unauthorized"
        className="w-80 h-60 mb-6"
      />
      <h1 className="text-4xl font-bold mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        You don't have permission to access this resource.
      </p>
      <div className="flex gap-3">
        <Link
          to="/auth/sign-in"
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Sign In
        </Link>
        <Link to="/dashboard/home" className="px-4 py-2 border rounded-md">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
