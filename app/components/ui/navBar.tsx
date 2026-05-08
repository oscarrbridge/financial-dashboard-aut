'use client';

import { NavIcon } from "./ui";
import { ChartPie, CreditCard, ChartBar, Scale } from "lucide-react"

export default function NavBar(){
    return (
        <div className="flex flex-col gap-3">
            <NavIcon icon={ChartPie} text="Dashboard" link="/" />
            <NavIcon icon={CreditCard} text="Transcations" link="/transactions" />
            <NavIcon icon={ChartBar} text="Budgets" link="/budgets" />
            <NavIcon icon={Scale} text="Resources" link="/resources" />
        </div>
    );
}
