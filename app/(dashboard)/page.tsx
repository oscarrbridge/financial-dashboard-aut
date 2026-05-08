'use client';

import { Button, Input, Wrapper, MultiSelect, NavIcon } from '@/app/components/ui/ui'
import { useAuth } from '@/context/authContext'
import { CreditCard } from 'lucide-react'

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
      <NavIcon icon={CreditCard} text="text" link="/transactions"/>
    </Wrapper>
  );
}