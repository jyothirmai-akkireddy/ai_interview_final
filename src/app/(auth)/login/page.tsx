"use client";

import { useState } from "react";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { auth, googleProvider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "auth/popup-blocked"
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!resetEmail) {
        setError("Enter your registered email");
        return;
      }

      await sendPasswordResetEmail(auth, resetEmail);
      setError("Password reset email sent. Check your inbox.");
      setShowReset(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send reset email."
      );
    }
  };

  return (
    <>
      <main className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md w-full space-y-6">
          <h2 className="text-center text-white text-2xl font-semibold">
            Login
          </h2>

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p
            onClick={() => setShowReset(true)}
            className="cursor-pointer text-sm text-purple-400"
          >
            Forgot password?
          </p>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button onClick={handleLogin}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Button onClick={handleGoogleLogin}>Continue with Google</Button>

          <p className="text-sm text-center text-gray-300">
            Don't have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              className="cursor-pointer text-purple-400"
            >
              Register
            </span>
          </p>
        </Card>
      </main>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="max-w-md w-full space-y-6">
            <h2 className="text-center text-white text-xl font-semibold">
              Reset Password
            </h2>

            <p className="text-center text-sm text-gray-300">
              Enter your registered email
            </p>

            <Input
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />

            <Button onClick={handleResetPassword}>Send Reset Link</Button>

            <Button onClick={() => setShowReset(false)}>Cancel</Button>
          </Card>
        </div>
      )}
    </>
  );
}
