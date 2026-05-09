import { Button } from "./ui";
import './accountWindow.css'
import { useAuth } from "@/context/authContext";
import { signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/router";

export default function AccountWindow() {
    const user = useAuth();
    const router = useRouter();

    async function handleSignOut() {
        await signOut();
        router.push("/login");
    }

    return (
        <div className="account-window ">
            Hi {user?.displayName}!
            <Button width={180} onClick={handleSignOut}>Sign Out</Button>
            <Button width={180}>My Account</Button>
        </div>
    );
}