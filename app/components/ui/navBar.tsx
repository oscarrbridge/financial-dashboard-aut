import Link from "next/link";

export default function NavBar(){
    return (
        <div className="flex flex-col ">
            <Link href="/">Dashboard</Link>
            <Link href="/transactions">Transcations</Link>
            <Link href="/budgets">Budgets</Link>
            <Link href="/resources">resources</Link>
        </div>
    );
}