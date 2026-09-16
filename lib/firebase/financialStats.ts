import { useMemo } from 'react';
import { Transaction } from '../firebase/transactions'

export default function useFinancialStats(transactions: Transaction[]) {
  return useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const debt = transactions
      .filter(t => t.type === 'Debt')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses - debt;
    const surplus = income - expenses;
    const savingsRate = income > 0 ? (surplus / income) * 100 : 0;

    // top spending category
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'Expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + t.amount;
      });

    let topCategory = '';
    let topCategoryAmount = 0;

    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > topCategoryAmount) {
        topCategoryAmount = amount;
        topCategory = category;
      }
    });

    return { income, expenses, debt, balance, surplus, savingsRate, topCategory, topCategoryAmount};
  }, [transactions]);
}