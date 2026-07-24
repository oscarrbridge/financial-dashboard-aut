'use client';

import { Button, Input, Wrapper, MultiSelect, NavIcon } from '@/app/components/ui/ui'
import StatCard from '../components/ui/statCard';
import { useAuth } from '@/context/authContext'
import { CreditCard } from 'lucide-react'

export default function DashboardPage() {
  const user = useAuth();

  function showToast() {
    console.log(user);
  }

  return (
    <div className='flex flex-col w-full h-full p-6 gap-5 bg-red-500'>
      
      <div className='flex flex-row w-full justify-between gap-5'>
        
        <StatCard title="Balance" value="NZ$1000"/>
        <StatCard title="Income" value="NZ$1000"/>
        <StatCard title="Expenses" value="NZ$1000"/>
        <StatCard title="Surplus" value="NZ$1000"/>
      
      </div>

        <div className='flex flex-col gap-2 w-full'>
          <div><h2 className='font-semibold text-2xl'>Financial Insights</h2></div>
          <Wrapper className='w-full'>
            <div className='w-full text-left'><p className='text-xl'>Top spending category:</p></div>
            <div className='w-full text-left'><p className='text-xl'>Savings rate:</p></div>
            <div className='w-full text-left'><p className='text-xl'>Savings projection:</p></div>
          </Wrapper>
        </div>

    </div>

  );
}