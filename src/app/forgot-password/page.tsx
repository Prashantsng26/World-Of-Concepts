"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { StarsBackground } from "@/components/layout/StarsBackground";
import { Book, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
    const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to send OTP");

            setSuccessMessage(data.message);
            setStep("OTP");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to reset password");

            // Success! Redirect to login
            router.push("/login?message=Password reset successful. Please log in.");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            <StarsBackground />
            <div className="absolute top-8 left-8">
                <Link href="/" className="flex items-center gap-2">
                    <Book className="text-primary w-6 h-6" />
                    <span className="text-xl font-bold font-serif">WOC</span>
                </Link>
            </div>

            <Card className="w-full max-w-md glass border-white/10 shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-serif">
                        {step === "EMAIL" ? "Forgot Password" : "Reset Password"}
                    </CardTitle>
                    <CardDescription>
                        {step === "EMAIL"
                            ? "Enter your email to receive a recovery OTP."
                            : `Enter the OTP sent to ${email} and your new password.`
                        }
                    </CardDescription>
                </CardHeader>

                {step === "EMAIL" ? (
                    <form onSubmit={handleSendOTP}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? "Sending OTP..." : "Send OTP"}
                            </Button>
                            <Link href="/login" className="flex items-center gap-2 text-sm text-center text-muted-foreground hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </CardFooter>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <CardContent className="space-y-4">
                            {successMessage && (
                                <div className="p-3 text-sm bg-primary/10 border border-primary/20 text-primary rounded-md">
                                    {successMessage}
                                </div>
                            )}
                            {error && (
                                <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">OTP Code</label>
                                <Input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                                <p className="text-xs text-muted-foreground">Check your server logs for the OTP (Mock Mode).</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">New Password</label>
                                <Input
                                    type="password"
                                    placeholder="Enter new password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? "Resetting Password..." : "Reset Password"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep("EMAIL")}
                                className="flex items-center gap-2 text-sm text-center text-muted-foreground hover:text-white transition-colors justify-center w-full"
                            >
                                <ArrowLeft className="w-4 h-4" /> Change Email
                            </button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
