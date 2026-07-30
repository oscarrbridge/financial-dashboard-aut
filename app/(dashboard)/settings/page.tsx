"use client";

import { useEffect, useState } from "react";
import { Wrapper, Button, Input } from "@/app/components/ui/ui";
import { requireAuth } from "@/lib/firebase/requireAuth";
import { updateDisplayName, resetPassword } from "@/lib/firebase/auth";

export default function SettingsPage() {
	const { user, loading } = requireAuth();

	const isGoogleUser = user?.providerData[0]?.providerId === "google.com";

	// Full name
	const [fullName, setFullName] = useState("");
	const [nameMessage, setNameMessage] = useState("");

	useEffect(() => {
		if (user) setFullName(user.displayName ?? "");
	}, [user]);

	const handleUpdateName = async () => {
		if (fullName.trim() === "") {
			setNameMessage("Name can't be empty");
			return;
		}
		try {
			setNameMessage("Saving...");
			await updateDisplayName(fullName.trim());
			setNameMessage("Name updated");
		} catch (error) {
			setNameMessage("Something went wrong, try again");
		}
	};

	// Password reset (password accounts only)
	const [passwordMessage, setPasswordMessage] = useState("");

	const handleResetPassword = async () => {
		if (!user?.email) {
			setPasswordMessage("No email address found for this account");
			return;
		}

		try {
			setPasswordMessage("Sending reset email...");
			await resetPassword(user.email);
			setPasswordMessage("Check your inbox for a password reset link");
		} catch (error) {
			if (error instanceof Error) {
				setPasswordMessage(error.message);
			}
		}
	};

	if (loading || !user) {
		return (
			<div className="flex items-center h-screen">
				<Wrapper>Loading...</Wrapper>
			</div>
		);
	}

	return (
		<div className="flex items-center h-screen">
			<Wrapper>
				<div className="flex flex-col gap-(--space-3) w-[320px]">
					<div className="flex flex-col text-center">
						Settings
					</div>

					{/* Full name — everyone */}
					<div className="flex flex-col gap-(--space-3)">
						<div>Full Name</div>
						{nameMessage != "" && (
							<p className="text-error-text">{nameMessage}</p>
						)}
						<Input
							value={fullName}
							onChange={setFullName}
							placeholder="Full Name"
							autoComplete="off"
							name="name"
							id="name"
							maxLength={50}
						/>
						<div className="self-start">
							<Button onClick={handleUpdateName} type="button" buttonText="Save Name" width={160} />
						</div>
					</div>

					{isGoogleUser ? (
						<div className="flex flex-col text-center">
							Signed in with Google — your email and password are managed by
							your Google account.
						</div>
					) : (
						<>


							{/* Password — password accounts only */}
							<div className="flex flex-col gap-(--space-3)">
								<div>Reset Password</div>
								{passwordMessage != "" && (
									<p className="text-error-text">{passwordMessage}</p>
								)}
								<p className="text-sm text-gray-600">
									We’ll send a password reset link to your email address.
								</p>
								<div className="self-start">
									<Button onClick={handleResetPassword} type="button" buttonText="Send Password Reset Link" width={220} />
								</div>
							</div>
						</>
					)}
				</div>
			</Wrapper>
		</div>
	);
}
