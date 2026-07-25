'use client';

import { useState, useEffect } from 'react'
import { Button, Input, Wrapper, MultiSelect, NavIcon } from '@/app/components/ui/ui'
import StatCard from '../components/ui/statCard';
import { useAuth } from '@/context/authContext'
import { CreditCard } from 'lucide-react'
import useFinancialStats from '@/lib/firebase/financialStats'
import { getUserTransactions } from "@/lib/firebase/transactions";
import { Transaction } from '@/lib/firebase/transactions'
import { formatCurrency } from '@/lib/transactions/formatCurrency';


export default function DashboardPage() {
  const user = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
    useEffect(() => {
      async function loadTransactions() {
        if (!user) return;
        const savedTransactions = await getUserTransactions(user.uid);
        setTransactions(savedTransactions);
      }
      loadTransactions();
    }, [user]);

  const stats = useFinancialStats(transactions)

  return (
    <div className='flex flex-col w-full h-full p-6 gap-5 bg-red-500'>
      
      <div className='flex flex-row w-full justify-between gap-5'>
        
        <StatCard title="Balance" value={formatCurrency(stats.balance)}/>
        <StatCard title="Income" value={formatCurrency(stats.income)}/>
        <StatCard title="Expenses" value={formatCurrency(stats.expenses)}/>
        <StatCard title="Surplus" value={formatCurrency(stats.surplus)}/>
      
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