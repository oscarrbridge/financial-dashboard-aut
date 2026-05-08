"use client";

import { useState } from "react";
import { Wrapper, Button, Input, MultiSelect } from "@/app/components/ui/ui";
import { signUp, signIn } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";

export default function LoginPage() {
	const router = useRouter();

	const [activeOption, setActiveOption] = useState("Login");

	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [loginMessage, setLoginMessage] = useState("");

	const signUpUser = async () => {
		if (fullName == "" || email == "" || password == "") {
			setLoginMessage("All fields must be filled in");
			return;
		}

		if (password != confirmPassword) {
			setLoginMessage("Passwords must match");
			return;
		}
		if (password.length < 6) {
			setLoginMessage("Password must be longer than 6 char");
			return;
		}
		try {
			setLoginMessage("Signing Up...");
			await signUp(email, password);
			router.push("/");
		} catch (error) {
			if (error instanceof FirebaseError) {
				switch (error.code) {
					case "auth/email-already-in-use":
						setLoginMessage("This email is in use");
						break;
					case "auth/invalid-email":
						setLoginMessage("Invalid email");
						break;
					case "auth/weak-password":
						setLoginMessage("Password is too weak");
						break;
					default:
						setLoginMessage("error.message");
				}
			}
		}
	};

	const loginUser = async () => {
		try {
			setLoginMessage("Logging in...");
			await signIn(email, password);
			router.push("/");
		} catch (error) {
			if (error instanceof FirebaseError) {
				switch (error.code) {
					case "auth/invalid-email":
						setLoginMessage("Invalid email");
						break;
					case "auth/invalid-credential":
						setLoginMessage("Incorrect email or password");
						break;
					case "auth/too-many-requests":
						setLoginMessage("Too many attempts, try again later");
						break;
					default:
						setLoginMessage(error.message);
				}
			}
		}
	};

	return (
		<div className="flex items-center h-screen">
			<Wrapper>
				<MultiSelect
					options={["Login", "Sign Up"]}
					onChange={(option) => {
						setActiveOption(option);
						setLoginMessage("");
					}}
				/>

				{activeOption === "Login" && (
					<>
						<form className="flex flex-col gap-(--space-3)">
							<div className="flex flex-col text-center">
								Login
								{loginMessage != "" && (
									<p className="text-error-text">{loginMessage}</p>
								)}
							</div>

							<Input
								value={email}
								onChange={setEmail}
								placeholder="Email"
								autoComplete="email"
								name="email"
								id="email"
							/>
							<Input
								value={password}
								onChange={setPassword}
								placeholder="Password"
								type="password"
								autoComplete="password"
								name="password"
								id="password"
							/>
							<Button onClick={loginUser} type="button" buttonText="Login" />
						</form>
					</>
				)}

				{activeOption === "Sign Up" && (
					<>
						<form className="flex flex-col gap-(--space-3)">
							<div className="flex flex-col text-center">
								Sign Up
								{loginMessage != "" && (
									<p className="text-error-text">{loginMessage}</p>
								)}
							</div>

							<Input
								value={fullName}
								onChange={setFullName}
								placeholder="Full Name"
								autoComplete="name"
								name="name"
								id="name"
							/>
							<Input
								value={email}
								onChange={setEmail}
								placeholder="Email"
								autoComplete="email"
								name="email"
								id="email"
							/>
							<Input
								value={password}
								onChange={setPassword}
								placeholder="Password"
								type="password"
								autoComplete="password"
								name="password"
								id="password"
							/>
							<Input
								value={confirmPassword}
								onChange={setConfirmPassword}
								placeholder="Confirm Password"
								type="password"
								autoComplete="new-password"
								name="new-password"
								id="new-password"
							/>
							<Button onClick={signUpUser} type="button" buttonText="Sign Up" />
						</form>
					</>
				)}
			</Wrapper>
		</div>
	);
}
