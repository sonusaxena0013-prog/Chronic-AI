import { Outlet } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";

export default function MainLayout() {
    return (
        <div className="app">

            <Sidebar />

            <main className="main">

                <Navbar />

                <div className="pageContent">
                    <Outlet />
                </div>

            </main>

        </div>
    );
}