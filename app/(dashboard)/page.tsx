'use client';

import { Button, Input, Wrapper, MultiSelect, Toast } from '@/app/components/ui/ui'
import { useAuth } from '@/context/authContext'

export default function DashboardPage() {
  const user = useAuth();

  function test() {
    console.log(user);
  }

  return (
    <Wrapper>
      <div>Dashboard</div>
      <Button onClick={test} buttonText="hello" />
      <Input placeholder="test placeholder" />
      <MultiSelect options={["Option1", "Option2", "Option3"]}/>
      {/* <Toast value='Test Toast' timeout={3} color='red-600'/> */}
    </Wrapper>
  );
}