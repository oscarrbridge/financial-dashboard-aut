'use client';

import { Button, Input, Wrapper, MultiSelect, NavIcon } from '@/app/components/ui/ui'
import { useAuth } from '@/context/authContext'
import { CreditCard } from 'lucide-react'

export default function DashboardPage() {
  const user = useAuth();

  function showToast() {
    console.log(user);
  }

  return (
    <div className='flex flex-col w-full h-full p-6 bg-red-500'>
      <div className='flex flex-row w-full justify-around'>
        
        <div className='flex flex-col gap-2'>
          <div><h2 className='font-semibold text-3xl'>Balance</h2></div>
          <Wrapper className='h-10'>
            <div><p className='text-2xl'>NZ$1000</p></div>
          </Wrapper>
        </div>

        <div className='flex flex-col gap-2'>
          <div><h2 className='font-semibold text-3xl'>Income</h2></div>
          <Wrapper className='h-10'>
            <div><p className='text-2xl'>NZ$1000</p></div>
          </Wrapper>
        </div>

        <div className='flex flex-col gap-2'>
          <div><h2 className='font-semibold text-3xl'>Expenses</h2></div>
          <Wrapper className='h-10'>
            <div><p className='text-2xl'>NZ$1000</p></div>
          </Wrapper>
        </div>

        <div className='flex flex-col gap-2'>
          <div><h2 className='font-semibold text-3xl'>Surplus</h2></div>
          <Wrapper className='h-10'>
            <div><p className='text-2xl'>NZ$1000</p></div>
          </Wrapper>
        </div>

      </div>

        <div className='flex flex-col gap-2'>
          <div><h2 className='font-semibold text-3xl'>Surplus</h2></div>
          <Wrapper className='w-full h-10'>
            <div><p className='text-2xl'>NZ$1000</p></div>
          </Wrapper>
        </div>

    </div>

  );
}