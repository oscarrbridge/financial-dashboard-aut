'use client';

import { useState, useEffect, useMemo } from 'react'
import { Button, Input, Wrapper, MultiSelect, NavIcon, DropDown } from '@/app/components/ui/ui'
import StatCard from '../components/ui/statCard';
import { useAuth } from '@/context/authContext'
import { CreditCard } from 'lucide-react'
import useFinancialStats from '@/lib/firebase/financialStats'
import { getUserTransactions } from "@/lib/firebase/transactions";
import { Transaction } from '@/lib/firebase/transactions'
import { formatCurrency } from '@/lib/transactions/formatCurrency';
import { matchesTransactionFilter } from '@/lib/transactions/filterTransactions';

const timeframeDays: Record<string, number> = {
  '7D': 7,
  '30D': 30,
  '365D': 365,
};

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

export default function DashboardPage() {
  const user = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeframe, setTimeframe] = useState('30D');

  useEffect(() => {
    async function loadTransactions() {
      if (!user) return;
      const savedTransactions = await getUserTransactions(user.uid);
      setTransactions(savedTransactions);
    }
    loadTransactions();
  }, [user]);

  const filteredTransactions = useMemo(() => {
    const days = timeframeDays[timeframe];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    return transactions.filter(t =>
      matchesTransactionFilter(t, {
        startDate: formatDate(startDate),
        endDate: formatDate(today),
      })
    );
  }, [transactions, timeframe]);

  const stats = useFinancialStats(filteredTransactions)

  return (
    <div className='flex flex-col w-full h-full p-6 gap-5'>
      <div className='w-full flex justify-end'>
        <Wrapper className='h-2'>
          <div className='flex flex-row'>
            <p className='text-xl'>Timeframe:</p>
            <DropDown options={["7D", "30D", "365D"]} onChange={setTimeframe} />
          </div>
        </Wrapper>
      </div>

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