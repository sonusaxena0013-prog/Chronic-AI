import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    /* =========================================
       AUTH CHECK LOADING
    ========================================= */

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#080d1b",
                    color: "#f5f7ff",
                    fontFamily: "inherit",
                    fontSize: "14px",
                }}
            >
                Loading Chronic AI...
            </div>
        );
    }

    /* =========================================
       NOT LOGGED IN
    ========================================= */

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }

    /* =========================================
       LOGGED IN
    ========================================= */

    return <Outlet />;
}