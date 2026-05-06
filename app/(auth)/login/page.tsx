'use client';

import { useState } from "react"
import { Wrapper, Button, Input, MultiSelect } from '@/app/components/ui/ui'
import { signUp, signIn } from '@/lib/firebase/auth'
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
    if(fullName == "" || email == "" || password == "") {
      setLoginMessage("All fields must be filled in");
      return;
    }

    if(password != confirmPassword) {
      setLoginMessage("Passwords must match");
      return;
    }
    if(password.length < 6) {
      setLoginMessage("Password must be longer than 6 char");
      return;
    }
    try {
      setLoginMessage("Signing Up...")
      await signUp(email, password);
      router.push("/");
    } catch (error) {
        setLoginMessage("other error");
    }
  }

  const loginUser = async () => {
    try {
      setLoginMessage("Logging in...")
      await signIn(email, password);
      router.push("/")
    } catch (error) {
      setLoginMessage("other error");
    }
  }

  return (
      <Wrapper>
        <MultiSelect options={["Login", "Sign Up"]} onChange={(option) => setActiveOption(option)}/>
        
        {activeOption === "Login" && (
          <>
          <div>Login</div>

          {loginMessage != "" && (
            <p className="">{loginMessage}</p> // FIX: Color should be error color
          )}

          <Input value={email} onChange={setEmail} placeholder="Email" />
          <Input value={password} onChange={setPassword} placeholder="Password" />
          <Button onClick={loginUser} buttonText="Login" />
          </>
        )}


        {activeOption === "Sign Up" && (
          <>
          <div>Sign Up</div>
          
          {loginMessage != "" && (
            <p className="">{loginMessage}</p> // FIX: Color should be error color
          )}
          
          <Input value={fullName} onChange={setFullName} placeholder="Full Name" />
          <Input value={email} onChange={setEmail} placeholder="Email" />
          <Input value={password} onChange={setPassword} placeholder="Password" />
          <Input value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm Password" />
          <Button onClick={signUpUser} buttonText="Sign Up" />
          </>
        )}

      
      
      </Wrapper>
  );
}