"use client";

import { NavIcon } from "./ui";
import { ChartPie, CreditCard, ChartBar, Scale, User } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AccountWindow from "./accountWindow";

export default function NavBar() {
	const pathName = usePathname();

	const [accountView, setAccountView] = useState(false);

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
			<NavIcon icon={Scale} text="Resources" link="/resources" active={pathName === "/resources"}/>
			<div className="mt-auto pb-5">
				<NavIcon icon={User} text="Account" onClick={() => setAccountView(!accountView)}/>
			</div>
			{accountView && (
				<>
					<div className="fixed inset-0 z--999 bg-black" onClick={() => setAccountView(false)} />
					<AccountWindow />
				</>
				)}
		</div>
	);
}
