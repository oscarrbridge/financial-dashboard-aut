"use client";

import { useState } from "react";
import { Wrapper, Button, Input, MultiSelect } from "@/app/components/ui/ui";
import { signUp, signIn } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { sign } from "crypto";

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
			setLoginMessage("other error");
		}
	};

	const loginUser = async () => {
		try {
			setLoginMessage("Logging in...");
			await signIn(email, password);
			router.push("/");
		} catch (error) {
			setLoginMessage("other error");
		}
	};

	return (
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
					<form action={loginUser} className="flex flex-col gap-(--space-3)">
						<div className="flex flex-col text-center">
							Login
							{loginMessage != "" && (
								<p className="text-error-text">{loginMessage}</p>
							)}
						</div>

						<Input value={email} onChange={setEmail} placeholder="Email" />
						<Input
							value={password}
							onChange={setPassword}
							placeholder="Password"
						/>
						<Button type="submit" buttonText="Login" />
					</form>
				</>
			)}

			{activeOption === "Sign Up" && (
				<>
					<form action={loginUser} className="flex flex-col gap-(--space-3)">
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
						/>
						<Input value={email} onChange={setEmail} placeholder="Email" />
						<Input
							value={password}
							onChange={setPassword}
							placeholder="Password"
						/>
						<Input
							value={confirmPassword}
							onChange={setConfirmPassword}
							placeholder="Confirm Password"
						/>
						<Button type="submit" buttonText="Sign Up" />
					</form>
				</>
			)}
		</Wrapper>
	);
}
