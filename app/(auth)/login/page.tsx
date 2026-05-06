'use client';

import { useState } from "react"
import { Wrapper, Button, Input, MultiSelect } from '@/app/components/ui/ui'

export default function LoginPage() {

  const [activeOption, setActiveOption] = useState("Login");

  return (
      <Wrapper>
        <MultiSelect options={["Login", "Sign Up"]} onChange={(option) => setActiveOption(option)}/>
        
        {activeOption === "Login" && (
          <>
          <div>Login</div>
          <Input placeholder="Full Name" />
          <Input placeholder="Password" />
          <Button buttonText="Login" />
          </>
        )}


        {activeOption === "Sign Up" && (
          <>
          <div>Sign Up</div>
          <Input placeholder="Full Name" />
          <Input placeholder="Password" />
          <Input placeholder="Confirm Password" />
          <Button buttonText="Login" />
          </>
        )}

      
      
      </Wrapper>
  );
}