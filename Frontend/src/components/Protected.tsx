import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedProps {
    children: ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
    const isLoggedIn = localStorage.getItem("login");
    return isLoggedIn ? children : <Navigate to="/login" replace />;
}
