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
import { matchesTransactionFilter, normalizeCsvDate } from '@/lib/transactions/filterTransactions';
import GroupedBar from '../components/charts/groupedBar';
import LineChart from '../components/charts/lineChart';

const timeframeDays: Record<string, number> = {
  '7D': 7,
  '30D': 30,
  '365D': 365,
};

const budgetByCategory: Record<string, number> = {
  Accommodation: 400,
  Groceries: 300,
  'Food & Dining': 200,
  Transport: 150,
  Education: 120,
  Entertainment: 100,
  Utilities: 120,
  'Personal Care': 90,
};

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

export default function DashboardPage() {
  const user = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeframe, setTimeframe] = useState('7D');

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

  const categorySpend = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'Expense')
      .forEach(t => {
        totals[t.category] = (totals[t.category] ?? 0) + t.amount;
      });
    return totals;
  }, [filteredTransactions]);

  const budgetCategories = Object.keys(budgetByCategory);

  const budgetVsActualSeries = useMemo(() => [
    { name: 'Budget', data: budgetCategories.map(c => budgetByCategory[c]), color: '#6366f1' },
    { name: 'Actual', data: budgetCategories.map(c => categorySpend[c] ?? 0), color: '#f97316' },
  ], [categorySpend, budgetCategories]);

  const dailyExpenseData = useMemo(() => {
    const days = timeframeDays[timeframe];
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - days);

    const totals: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'Expense')
      .forEach(t => {
        const date = normalizeCsvDate(t.date);
        totals[date] = (totals[date] ?? 0) + t.amount;
      });

    const points: { label: string; value: number }[] = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const dateStr = formatDate(cursor);
      points.push({ label: dateStr, value: totals[dateStr] ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return points;
  }, [filteredTransactions, timeframe]);

  const previousPeriodExpenses = useMemo(() => {
    const days = timeframeDays[timeframe];
    const currentStart = new Date();
    currentStart.setDate(currentStart.getDate() - days);
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - days);

    return transactions
      .filter(t => t.type === 'Expense')
      .filter(t => matchesTransactionFilter(t, {
        startDate: formatDate(previousStart),
        endDate: formatDate(previousEnd),
      }))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, timeframe]);

  const expensesDelta = stats.expenses - previousPeriodExpenses;
  const expensesPercentChange = previousPeriodExpenses > 0
    ? (expensesDelta / previousPeriodExpenses) * 100
    : 0;

  return (
    <div className='flex flex-col w-full h-full p-6 gap-5'>
      <div className='w-full flex justify-end'>
        <Wrapper className='h-2'>
          <div className='flex flex-row'>
            <p className='text-xl'>Timeframe:</p>
            <DropDown value={timeframe} options={["7D", "30D", "365D"]} onChange={setTimeframe} />
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

        <div className='flex flex-col gap-2 w-full'>
          <div><h2 className='font-semibold text-2xl'>Expenses Over Time</h2></div>
          <Wrapper className='w-full'>
            <div className='flex flex-col gap-1'>
              <p className='text-3xl'>{formatCurrency(stats.expenses)}</p>
              <p className={`text-sm ${expensesDelta <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(Math.abs(expensesDelta))} {expensesDelta <= 0 ? '↓' : '↑'}({Math.abs(expensesPercentChange).toFixed(2)}%) vs previous period
              </p>
            </div>
            <LineChart data={dailyExpenseData} />
          </Wrapper>
        </div>

        <div className='flex flex-col gap-2 w-full'>
          <div><h2 className='font-semibold text-2xl'>Budget vs Actual</h2></div>
          <GroupedBar categories={budgetCategories} series={budgetVsActualSeries} />
        </div>

    </div>

  );
}