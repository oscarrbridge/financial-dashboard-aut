"use client";

import { NavIcon } from "./ui";
import { ChartPie, CreditCard, ChartBar, Scale, User, Bell } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AccountWindow from "./accountWindow";
import { requireAuth } from "@/lib/firebase/requireAuth";
import {
  getUserBudgets,
  type BudgetPeriod,
} from "@/lib/firebase/budgets";
import { getUserTransactions } from "@/lib/firebase/transactions";

export default function NavBar() {
	const pathName = usePathname();

	const [accountView, setAccountView] = useState(false);
	const [hasBudgetAlerts, setHasBudgetAlerts] = useState(false);
	const { user } = requireAuth();

	useEffect(() => {
  if (!user) return;

  async function checkBudgetAlerts() {
    try {
      const [budgets, transactions] = await Promise.all([
        getUserBudgets(user!.uid),
        getUserTransactions(user!.uid),
      ]);

      const periods: { period: BudgetPeriod; days: number }[] = [
        { period: "Weekly", days: 7 },
        { period: "Fortnightly", days: 14 },
        { period: "Monthly", days: 30 },
      ];

      const hasAlert = periods.some(({ period, days }) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return budgets.some((budget) => {
          const periodLimit =
            period === "Weekly"
              ? budget.limit
              : period === "Fortnightly"
              ? budget.limit * 2
              : (budget.limit / 7) * 30;

          if (periodLimit <= 0) return false;

          const spent = transactions
            .filter(
              (transaction) =>
                transaction.type === "Expense" &&
                transaction.category === budget.category &&
                new Date(transaction.date) >= cutoff
            )
            .reduce(
              (total, transaction) => total + transaction.amount,
              0
            );

          return spent > periodLimit * 0.8;
        });
      });

      setHasBudgetAlerts(hasAlert);
    } catch (error) {
      console.error("Error checking budget alerts:", error);
    }
  }

  checkBudgetAlerts();
}, [user, pathName]);

	return (
		<div className="flex flex-col gap-3 ml-2 last:justify-end">
			<Image
				src="/images/AUTLogo.png"
				alt="AUT Logo"
				width="100"
				height="100"
			/>
			<NavIcon icon={ChartPie} text="Dashboard" link="/" active={pathName === "/"}/>
			<NavIcon icon={CreditCard} text="Transcations" link="/transactions" active={pathName === "/transactions"}/>
			<NavIcon icon={ChartBar} text="Budgets" link="/budgets" active={pathName === "/budgets"}/>
			<div className="relative">
			<NavIcon
				icon={Bell}
				text="Alerts"
				link="/budgets"
				active={false}
			/>

			{hasBudgetAlerts && (
				<span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></span>
			)}
			</div>
			<NavIcon icon={Scale} text="Resources" link="/resources" active={pathName === "/resources"}/>
			<div className="mt-auto pb-5">
				<NavIcon icon={User} text="Account" onClick={() => setAccountView(!accountView)}/>
			</div>
			{accountView && (
				<>
					<div className="fixed inset-0 z-10" onClick={() => setAccountView(false)} />
					<AccountWindow />
				</>
				)}
		</div>
	);
}
