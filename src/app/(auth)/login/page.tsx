"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

/* NEW STATE FOR RESET PASSWORD */
const [showReset, setShowReset] = useState(false);
const [resetEmail, setResetEmail] = useState("");

const handleLogin = async () => {
try {
setLoading(true);
setError("");

await signInWithEmailAndPassword(auth, email, password);

router.push("/dashboard");
} catch (err: any) {
setError(err.message);
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

  } catch (err: any) {

    if (err.code === "auth/popup-blocked") {
      await signInWithRedirect(auth, googleProvider);
    } else {
      setError(err.message);
    }

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

} catch (err: any) {
setError(err.message);
}

};

return (
<>

<main className="min-h-screen flex items-center justify-center px-6">
<Card className="max-w-md w-full space-y-6">

<h2 className="text-center text-white text-2xl font-semibold">Login</h2>

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
className="text-sm text-purple-400 cursor-pointer"
>
Forgot password?
</p>

{error && (

<p className="text-red-500 text-sm">{error}</p>
)}

<Button onClick={handleLogin}>
{loading ? "Logging in..." : "Login"}
</Button>

<Button onClick={handleGoogleLogin}>
Continue with Google
</Button>

<p className="text-sm text-center text-gray-300">
Don’t have an account?{" "}
<span
onClick={() => router.push("/register")}
className="text-purple-400 cursor-pointer"
>
Register
</span>
</p>

</Card>
</main>

{/* RESET PASSWORD MODAL */}

{showReset && (

<div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">

<Card className="max-w-md w-full space-y-6">

<h2 className="text-center text-white text-xl font-semibold">
Reset Password
</h2>

<p className="text-gray-300 text-sm text-center">
Enter your registered email
</p>

<Input
type="email"
placeholder="Email"
value={resetEmail}
onChange={(e) => setResetEmail(e.target.value)}
/>

<Button onClick={handleResetPassword}>
Send Reset Link
</Button>

<Button onClick={() => setShowReset(false)}>
Cancel </Button>

</Card>

</div>

)}

</>
);
}
