"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

export function requireAuth() {
    const user = useAuth();

    const router = useRouter();

    const loading = user === undefined;

    useEffect(() => {
        if (!loading && !user){
            router.replace("/login");
        }
    }, [user, loading, router]);

    return {user, loading};
}