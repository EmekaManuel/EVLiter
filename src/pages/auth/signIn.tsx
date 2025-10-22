import authImage from "@/assets/ev-image.jpg";
import { Button } from "@/components/ui/button";
import { FormField, SwitchField } from "@/components/ui/form-field";
import { useAuth } from "@/context/AuthContext";
import {
  forgotPasswordFields,
  type ForgotPasswordFormData,
  forgotPasswordSchema,
  signInFields,
  type SignInFormData,
  signInSchema,
  signUpFields,
  type SignUpFormData,
  signUpSchema,
  signUpSwitchFields,
} from "@/lib/auth-forms";
import { createUserToken } from "@/utils/simulateAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">(
    "signin"
  );
  const navigate = useNavigate();
  const { login } = useAuth();

  // Sign-in form
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Sign-up form
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      agreed: false,
    },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmitSignIn = async (data: SignInFormData) => {
    try {
      console.log("Sign-in submitted:", data);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a simulated JWT token for the user
      const token = createUserToken(`user_${Date.now()}`);

      // Login using the AuthContext
      login(token);

      // Redirect to customer portal
      navigate("/dashboard/overview");
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  const onSubmitSignUp = async (data: SignUpFormData) => {
    try {
      console.log("Sign-up submitted:", data);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a simulated JWT token for the new user
      const token = createUserToken(`user_${Date.now()}`);

      // Login using the AuthContext
      login(token);

      // Redirect to customer portal
      navigate("/customer-portal");
    } catch (error) {
      console.error("Sign-up error:", error);
    }
  };

  const onSubmitForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      console.log("Forgot password submitted:", data);
      // Here you would typically make an API call
      // await sendPasswordResetEmail(data.email);
      alert("Password reset email sent! Check your inbox.");
      setAuthMode("signin");
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  };

  const getCurrentForm = () => {
    switch (authMode) {
      case "signin":
        return {
          form: signInForm,
          onSubmit: onSubmitSignIn,
          fields: signInFields,
          switchFields: [],
          buttonText: signInForm.formState.isSubmitting
            ? "Signing in..."
            : "Sign In",
          title: "Welcome Back",
          subtitle: "Sign in to your account",
        };
      case "signup":
        return {
          form: signUpForm,
          onSubmit: onSubmitSignUp,
          fields: signUpFields,
          switchFields: signUpSwitchFields,
          buttonText: signUpForm.formState.isSubmitting
            ? "Signing up..."
            : "Sign Up",
          title: "Get Started Now",
          subtitle: "Create your account",
        };
      case "forgot":
        return {
          form: forgotPasswordForm,
          onSubmit: onSubmitForgotPassword,
          fields: forgotPasswordFields,
          switchFields: [],
          buttonText: forgotPasswordForm.formState.isSubmitting
            ? "Sending..."
            : "Send Reset Email",
          title: "Forgot Password",
          subtitle: "Enter your email to reset your password",
        };
    }
  };

  const currentForm = getCurrentForm();

  const renderFormFields = () => {
    if (authMode === "signin") {
      return (
        <>
          {signInFields.map((field) => (
            <FormField
              key={field.name}
              name={field.name}
              control={signInForm.control}
              label={field.label}
              placeholder={field.placeholder}
              type={field.type}
            />
          ))}
        </>
      );
    } else if (authMode === "signup") {
      return (
        <>
          {signUpFields.map((field) => (
            <FormField
              key={field.name}
              name={field.name}
              control={signUpForm.control}
              label={field.label}
              placeholder={field.placeholder}
              type={field.type}
            />
          ))}
          {signUpSwitchFields.map((field) => (
            <SwitchField
              key={field.name}
              name={field.name}
              control={signUpForm.control}
              label={field.label}
            />
          ))}
        </>
      );
    } else if (authMode === "forgot") {
      return (
        <>
          {forgotPasswordFields.map((field) => (
            <FormField
              key={field.name}
              name={field.name}
              control={forgotPasswordForm.control}
              label={field.label}
              placeholder={field.placeholder}
              type={field.type}
            />
          ))}
        </>
      );
    }
    return null;
  };

  const handleFormSubmit = () => {
    if (authMode === "signin") {
      return signInForm.handleSubmit(onSubmitSignIn);
    } else if (authMode === "signup") {
      return signUpForm.handleSubmit(onSubmitSignUp);
    } else if (authMode === "forgot") {
      return forgotPasswordForm.handleSubmit(onSubmitForgotPassword);
    }
    return () => {};
  };

  const getIsSubmitting = () => {
    if (authMode === "signin") {
      return signInForm.formState.isSubmitting;
    } else if (authMode === "signup") {
      return signUpForm.formState.isSubmitting;
    } else if (authMode === "forgot") {
      return forgotPasswordForm.formState.isSubmitting;
    }
    return false;
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
              {currentForm.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{currentForm.subtitle}</p>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleFormSubmit()} className="space-y-4">
              {renderFormFields()}

              <Button
                type="submit"
                disabled={getIsSubmitting()}
                className="w-full h-11 bg-green-700 hover:bg-green-800 text-white font-medium disabled:opacity-50"
              >
                {currentForm.buttonText}
              </Button>
            </form>
          </div>

          {/* Toggle links */}
          <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
            {authMode === "signin" && (
              <>
                <p>
                  Don't have an account?{" "}
                  <span
                    className="text-blue-600 font-medium cursor-pointer hover:underline"
                    onClick={() => setAuthMode("signup")}
                  >
                    Sign Up
                  </span>
                </p>
                <p>
                  Ready to get started?{" "}
                  <span
                    className="text-blue-600 font-medium cursor-pointer hover:underline"
                    onClick={() => navigate("/onboard")}
                  >
                    Go to Onboarding
                  </span>
                </p>
                <p>
                  <span
                    className="text-blue-600 font-medium cursor-pointer hover:underline"
                    onClick={() => setAuthMode("forgot")}
                  >
                    Forgot your password?
                  </span>
                </p>
              </>
            )}

            {authMode === "signup" && (
              <p>
                Have an account?{" "}
                <span
                  className="text-blue-600 font-medium cursor-pointer hover:underline"
                  onClick={() => setAuthMode("signin")}
                >
                  Sign In
                </span>
              </p>
            )}

            {authMode === "forgot" && (
              <p>
                Remember your password?{" "}
                <span
                  className="text-blue-600 font-medium cursor-pointer hover:underline"
                  onClick={() => setAuthMode("signin")}
                >
                  Sign In
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: image */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          alt="Monstera leaves"
          src={authImage}
          className="w-full h-screen object-cover rounded-tl-3xl rounded-bl-3xl"
        />
      </div>
    </div>
  );
}
