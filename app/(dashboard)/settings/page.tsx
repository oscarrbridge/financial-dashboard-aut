"use client";

import { useEffect, useState } from "react";
import { Wrapper, Button, Input } from "@/app/components/ui/ui";
import { requireAuth } from "@/lib/firebase/requireAuth";
import { updateDisplayName, changeEmail, changePassword } from "@/lib/firebase/auth";
import { FirebaseError } from "firebase/app";

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

	// Email (password accounts only)
	const [newEmail, setNewEmail] = useState("");
	const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
	const [emailMessage, setEmailMessage] = useState("");

	const handleChangeEmail = async () => {
		if (newEmail === "" || emailCurrentPassword === "") {
			setEmailMessage("All fields must be filled in");
			return;
		}
		if (newEmail === user?.email) {
			setEmailMessage("That's already your email");
			return;
		}
		try {
			setEmailMessage("Sending verification link...");
			await changeEmail(newEmail, emailCurrentPassword);
			setEmailMessage(
				`Check ${newEmail} for a verification link. Your email won't change until you click it.`
			);
			setEmailCurrentPassword("");
		} catch (error) {
			if (error instanceof FirebaseError) {
				switch (error.code) {
					case "auth/email-already-in-use":
						setEmailMessage("This email is in use");
						break;
					case "auth/invalid-email":
						setEmailMessage("Invalid email");
						break;
					case "auth/invalid-credential":
					case "auth/wrong-password":
						setEmailMessage("Incorrect password");
						break;
					case "auth/requires-recent-login":
						setEmailMessage("Please sign out and back in, then try again");
						break;
					case "auth/too-many-requests":
						setEmailMessage("Too many attempts, try again later");
						break;
					default:
						setEmailMessage(error.message);
				}
			}
		}
	};

	// Password (password accounts only)
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [passwordMessage, setPasswordMessage] = useState("");

	const handleChangePassword = async () => {
		if (currentPassword === "" || newPassword === "") {
			setPasswordMessage("All fields must be filled in");
			return;
		}
		if (newPassword !== confirmNewPassword) {
			setPasswordMessage("Passwords must match");
			return;
		}
		if (newPassword.length < 6) {
			setPasswordMessage("Password must be longer than 6 char");
			return;
		}
		try {
			setPasswordMessage("Saving...");
			await changePassword(currentPassword, newPassword);
			setPasswordMessage("Password updated");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmNewPassword("");
		} catch (error) {
			if (error instanceof FirebaseError) {
				switch (error.code) {
					case "auth/invalid-credential":
					case "auth/wrong-password":
						setPasswordMessage("Incorrect current password");
						break;
					case "auth/weak-password":
						setPasswordMessage("Password is too weak");
						break;
					case "auth/requires-recent-login":
						setPasswordMessage("Please sign out and back in, then try again");
						break;
					case "auth/too-many-requests":
						setPasswordMessage("Too many attempts, try again later");
						break;
					default:
						setPasswordMessage(error.message);
				}
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
							{/* Email — password accounts only */}
							<div className="flex flex-col gap-(--space-3)">
								<div>Change Email</div>
								{emailMessage != "" && (
									<p className="text-error-text">{emailMessage}</p>
								)}
								<Input
									value={newEmail}
									onChange={setNewEmail}
									placeholder="New Email"
									autoComplete="off"
									name="new-email"
									id="new-email"
								/>
								<Input
									value={emailCurrentPassword}
									onChange={setEmailCurrentPassword}
									placeholder="Current Password"
									type="password"
									autoComplete="new-password"
									name="email-current-password"
									id="email-current-password"
								/>
								<div className="self-start">
									<Button onClick={handleChangeEmail} type="button" buttonText="Update Email" width={160} />
								</div>
							</div>

							{/* Password — password accounts only */}
							<div className="flex flex-col gap-(--space-3)">
								<div>Change Password</div>
								{passwordMessage != "" && (
									<p className="text-error-text">{passwordMessage}</p>
								)}
								<Input
									value={currentPassword}
									onChange={setCurrentPassword}
									placeholder="Current Password"
									type="password"
									autoComplete="new-password"
									name="current-password"
									id="current-password"
								/>
								<Input
									value={newPassword}
									onChange={setNewPassword}
									placeholder="New Password"
									type="password"
									autoComplete="new-password"
									name="new-password"
									id="new-password"
								/>
								<Input
									value={confirmNewPassword}
									onChange={setConfirmNewPassword}
									placeholder="Confirm New Password"
									type="password"
									autoComplete="new-password"
									name="confirm-new-password"
									id="confirm-new-password"
								/>
								<div className="self-start">
									<Button onClick={handleChangePassword} type="button" buttonText="Update Password" width={160} />
								</div>
							</div>
						</>
					)}
				</div>
			</Wrapper>
		</div>
	);
}
