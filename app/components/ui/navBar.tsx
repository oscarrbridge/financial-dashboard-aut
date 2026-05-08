"use client";

import { NavIcon } from "./ui";
import { ChartPie, CreditCard, ChartBar, Scale } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function NavBar() {
	const pathName = usePathname();

	return (
		<div className="flex flex-col gap-3 ml-2">
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
		</div>
	);
}
