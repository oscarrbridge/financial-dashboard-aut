'use client';

import { useState, useEffect, useMemo, useRef } from 'react'
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
import SankeyChart from '../components/charts/sankeyChart';
import PieChart from '../components/charts/pieChart';

const timeframeDays: Record<string, number> = {
  '7D': 7,
  '30D': 30,
  '365D': 365,
};

const TIMEFRAME_STORAGE_KEY = 'dashboard.timeframe';

const flowCategoryColors = ['#a3b833', '#dc2626', '#a21caf', '#0ea5e9', '#f59e0b', '#14b8a6', '#e11d48', '#8b5cf6'];

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
  const isFirstTimeframeWrite = useRef(true);

  useEffect(() => {
    const savedTimeframe = localStorage.getItem(TIMEFRAME_STORAGE_KEY);
    if (savedTimeframe && timeframeDays[savedTimeframe]) {
      setTimeframe(savedTimeframe);
    }
  }, []);

  useEffect(() => {
    if (isFirstTimeframeWrite.current) {
      isFirstTimeframeWrite.current = false;
      return;
    }
    localStorage.setItem(TIMEFRAME_STORAGE_KEY, timeframe);
  }, [timeframe]);

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

  const topSpendingCategory = useMemo(() => {
  let topCategory = '';
  let maxSpend = 0;

  Object.entries(categorySpend).forEach(([category, amount]) => {
    if (amount > maxSpend) {
      maxSpend = amount;
      topCategory = category;
    }
  });

  return { category: topCategory, amount: maxSpend };
}, [categorySpend]);

  const savingsRate = useMemo(() => {
    const savingRates = stats.income > 0 ? ((stats.income - stats.expenses) / stats.income) * 100 : 0;
    return savingRates;
  }, [stats.income, stats.expenses]);
  
  const savingsProjection = useMemo(() => {
    const days = timeframeDays[timeframe];
    const weeklySpendRate = stats.expenses / (days / 7);

  if (stats.balance <= 0) {
    return { status: 'ranOut' as const };
  }

  if (weeklySpendRate <= 0) {
    return { status: 'noSpend' as const };
  }

  const weeksRemaining = stats.balance / weeklySpendRate;
  return { status: 'ok' as const, weeks: weeksRemaining };
  }, [stats.balance, stats.expenses, timeframe]);

  const budgetCategories = Object.keys(budgetByCategory);

  const budgetVsActualSeries = useMemo(() => [
    { name: 'Budget', data: budgetCategories.map(c => budgetByCategory[c]), color: '#6366f1' },
    { name: 'Actual', data: budgetCategories.map(c => categorySpend[c] ?? 0), color: '#f97316' },
  ], [categorySpend, budgetCategories]);

  const cumulativeExpenseData = useMemo(() => {
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
    let runningTotal = 0;
    while (cursor <= today) {
      const dateStr = formatDate(cursor);
      runningTotal += totals[dateStr] ?? 0;
      points.push({ label: dateStr, value: runningTotal });
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

  const incomeByCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'Income')
      .forEach(t => {
        totals[t.category] = (totals[t.category] ?? 0) + t.amount;
      });
    return totals;
  }, [filteredTransactions]);

  const cashFlowData = useMemo(() => {
    const nodes = [{ name: 'Income', color: '#4ade80', depth: 1 }];
    const links: { source: string; target: string; value: number }[] = [];

    Object.entries(incomeByCategory).forEach(([category, amount], index) => {
      nodes.push({ name: category, color: flowCategoryColors[index % flowCategoryColors.length], depth: 0 });
      links.push({ source: category, target: 'Income', value: amount });
    });

    Object.entries(categorySpend).forEach(([category, amount], index) => {
      nodes.push({ name: category, color: flowCategoryColors[index % flowCategoryColors.length], depth: 3 });
      links.push({ source: 'Income', target: category, value: amount });
    });

    if (stats.surplus > 0) {
      nodes.push({ name: 'Surplus', color: '#3b82f6', depth: 3 });
      links.push({ source: 'Income', target: 'Surplus', value: stats.surplus });
    }

    return { nodes, links };
  }, [incomeByCategory, categorySpend, stats.surplus]);

  const spendingBreakdown = useMemo(() =>
    Object.entries(categorySpend).map(([name, value], index) => ({
      name,
      value,
      color: flowCategoryColors[index % flowCategoryColors.length],
    })),
  [categorySpend]);

  const incomeBreakdown = useMemo(() =>
    Object.entries(incomeByCategory).map(([name, value], index) => ({
      name,
      value,
      color: flowCategoryColors[index % flowCategoryColors.length],
    })),
  [incomeByCategory]);

  const weeklyIncomeExpense = useMemo(() => {
    const days = timeframeDays[timeframe];
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - days);

    const weeks: { label: string; income: number; expenses: number }[] = [];
    const weekStart = new Date(start);
    let weekIndex = 1;

    while (weekStart <= today) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const cappedEnd = weekEnd > today ? today : weekEnd;

      const weekTransactions = filteredTransactions.filter(t => {
        const date = normalizeCsvDate(t.date);
        return date >= formatDate(weekStart) && date <= formatDate(cappedEnd);
      });

      weeks.push({
        label: `Week ${weekIndex}`,
        income: weekTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0),
        expenses: weekTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0),
      });

      weekStart.setDate(weekStart.getDate() + 7);
      weekIndex++;
    }

    return weeks;
  }, [filteredTransactions, timeframe]);

  const weeklyCategories = weeklyIncomeExpense.map(w => w.label);

  const weeklyIncomeExpenseSeries = useMemo(() => [
    { name: 'Income', data: weeklyIncomeExpense.map(w => w.income), color: '#4ade80' },
    { name: 'Expenses', data: weeklyIncomeExpense.map(w => w.expenses), color: '#f87171' },
  ], [weeklyIncomeExpense]);

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
            <div className='w-full text-left'>
              <p className='text-xl'>
                Top spending category: {topSpendingCategory.category
                  ? `${topSpendingCategory.category} (${formatCurrency(topSpendingCategory.amount)})`
                  : 'No expense data available for this period'}
              </p>
            </div>
            <div className='w-full text-left'>
              <p className='text-xl'>
                Savings rate: {stats.income > 0
                  ? `${savingsRate.toFixed(2)}%`
                  : 'No income data available for this period'}
              </p>
            </div>
            <div className='w-full text-left'>
              <p className='text-xl'>
                Savings projection: {
                  savingsProjection.status === 'ranOut'
                    ? "You've run out of money"
                    : savingsProjection.status === 'noSpend'
                    ? 'No spending detected for this period'
                    : `You may run short in ${savingsProjection.weeks.toFixed(1)} weeks assuming your current spending continues and are not earning any income`
                }
              </p>
            </div>
          </Wrapper>
        </div>

        <div className='flex flex-row w-full gap-5'>
          <div className='flex flex-col gap-2 w-full'>
            <div><h2 className='font-semibold text-2xl'>Budget vs Actual</h2></div>
            <GroupedBar categories={budgetCategories} series={budgetVsActualSeries} />
          </div>

          <div className='flex flex-col gap-2 w-full'>
            <div><h2 className='font-semibold text-2xl'>Cash Flow</h2></div>
            <Wrapper className='w-full'>
              <SankeyChart nodes={cashFlowData.nodes} links={cashFlowData.links} height={320} />
            </Wrapper>
          </div>
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
            <LineChart data={cumulativeExpenseData} />
          </Wrapper>
        </div>

        <div className='flex flex-row w-full gap-5'>
          <div className='flex flex-col gap-2 w-full'>
            <div><h2 className='font-semibold text-2xl'>Spending Breakdown</h2></div>
            <Wrapper className='w-full'>
              <PieChart data={spendingBreakdown} />
            </Wrapper>
          </div>

          <div className='flex flex-col gap-2 w-full'>
            <div><h2 className='font-semibold text-2xl'>Income Breakdown</h2></div>
            <Wrapper className='w-full'>
              <PieChart data={incomeBreakdown} />
            </Wrapper>
          </div>
        </div>

        <div className='flex flex-col gap-2 w-full'>
          <div><h2 className='font-semibold text-2xl'>Income vs Expenses</h2></div>
          <GroupedBar categories={weeklyCategories} series={weeklyIncomeExpenseSeries} />
        </div>

    </div>

  );
}