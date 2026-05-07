'use client';

import { Button, Input, Wrapper, MultiSelect } from '@/app/components/ui/ui'
import { useAuth } from '@/context/authContext'

export default function DashboardPage() {
  const user = useAuth();

  function showToast() {
    console.log();
  }

  return (
    <Wrapper>
      <div>Dashboard</div>
      <Button onClick={showToast} buttonText="hello" />
      <Input placeholder="test placeholder" />
      <MultiSelect options={["Option1", "Option2", "Option3"]}/>
    </Wrapper>
  );
}