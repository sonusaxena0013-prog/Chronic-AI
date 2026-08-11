import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "../../styles/sidebar.css";

import {
    FiMenu,
    FiPlus,
    FiMessageSquare,
    FiSettings,
    FiTrash2,
    FiChevronDown,
    FiUser,
    FiBell,
    FiHelpCircle,
    FiLogOut,
    FiShare2,
    FiCpu,
} from "react-icons/fi";

import { useChats } from "../../context/ChatContext";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {

    /* =====================================================
       STATES
    ===================================================== */

    const [collapsed, setCollapsed] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);


    /* =====================================================
       PROFILE
    ===================================================== */

    const [profile, setProfile] = useState(() => {
        try {
            const saved =
                localStorage.getItem("chronic_profile");

            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error(
                "Profile load error:",
                error
            );
        }

        return {
            name: "Kartik",
            role: "Developer",
            avatar: "/profile.png",
        };
    });


    /* =====================================================
       ROUTER
    ===================================================== */

    const navigate = useNavigate();
    const location = useLocation();


    /* =====================================================
       AUTH
    ===================================================== */

    const { user, logout } = useAuth();


    /* =====================================================
       CHAT CONTEXT
    ===================================================== */

    const {
        chats,
        currentChatId,
        setCurrentChatId,
        createChat,
        deleteChat,
    } = useChats();


    /* =====================================================
       NOTIFICATION CONTEXT
    ===================================================== */

    const {
        unreadCount,
        openNotifications,
    } = useNotifications();


    /* =====================================================
       PROFILE SYNC
    ===================================================== */

    useEffect(() => {

        const loadProfile = () => {

            try {

                const saved =
                    localStorage.getItem(
                        "chronic_profile"
                    );

                if (saved) {

                    const updatedProfile =
                        JSON.parse(saved);

                    setProfile(updatedProfile);

                }

            } catch (error) {

                console.error(
                    "Profile sync error:",
                    error
                );

            }
        };


        loadProfile();


        window.addEventListener(
            "profileUpdated",
            loadProfile
        );


        return () => {

            window.removeEventListener(
                "profileUpdated",
                loadProfile
            );

        };

    }, []);


    /* =====================================================
       NEW CHAT
    ===================================================== */

    const handleNewChat = async () => {
    const chatId = await createChat();

    if (!chatId) return;

    setShowProfileMenu(false);

    navigate("/");
};


    /* =====================================================
       OPEN CHAT
    ===================================================== */

    const handleOpenChat = (id) => {

        setCurrentChatId(id);

        setShowProfileMenu(false);

        navigate("/");
    };


    /* =====================================================
       DELETE CHAT
    ===================================================== */

    const handleDeleteChat = (
        event,
        id
    ) => {

        event.stopPropagation();

        deleteChat(id);
    };


    /* =====================================================
       SETTINGS
    ===================================================== */

    const handleSettings = () => {

        setShowProfileMenu(false);

        navigate("/settings");
    };


    /* =====================================================
       PROFILE MENU
    ===================================================== */

    const toggleProfileMenu = () => {

        if (collapsed) return;

        setShowProfileMenu(
            (previous) => !previous
        );
    };


    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    const handleNotifications = () => {

        setShowProfileMenu(false);

        openNotifications();
    };


    /* =====================================================
       HELP
    ===================================================== */

    const handleHelp = () => {

        setShowProfileMenu(false);

        navigate("/help");
    };


    /* =====================================================
       EXPORT / SHARE CHATS
    ===================================================== */

    const handleExportChats = async () => {

        if (!chats || chats.length === 0) {

            alert(
                "No chats available to export."
            );

            setShowProfileMenu(false);

            return;
        }


        /* ===============================================
           BUILD EXPORT TEXT
        =============================================== */

        const exportText = chats
            .map((chat) => {

                const messages =
                    (chat.messages || [])
                        .map((message) => {

                            const role =
                                message.role === "user"
                                    ? "You"
                                    : "Chronic AI";

                            return `${role}:\n${
                                message.content || ""
                            }`;

                        })
                        .join("\n\n");


                return messages.trim();

            })
            .join("\n\n\n");


        /* ===============================================
           TRY NATIVE SHARE
        =============================================== */

        try {

            if (navigator.share) {

                await navigator.share({
                    title:
                        "Chronic AI — My Chats",
                    text: exportText,
                });

                setShowProfileMenu(false);

                return;
            }


            /* ===========================================
               CLIPBOARD FALLBACK
            =========================================== */

            if (navigator.clipboard) {

                await navigator.clipboard.writeText(
                    exportText
                );

                alert(
                    "Chats copied to clipboard."
                );

                setShowProfileMenu(false);

                return;
            }


            /* ===========================================
               TXT FILE FALLBACK
            =========================================== */

            const blob = new Blob(
                [exportText],
                {
                    type:
                        "text/plain;charset=utf-8",
                }
            );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                "chronic-ai-chats.txt";


            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);

            setShowProfileMenu(false);

        } catch (error) {

            /*
                User closing native share dialog
                is not a real error.
            */

            if (
                error?.name ===
                "AbortError"
            ) {

                setShowProfileMenu(false);

                return;
            }


            console.error(
                "Export error:",
                error
            );


            alert(
                "Unable to export chats."
            );


            setShowProfileMenu(false);
        }
    };


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = async () => {

        if (loggingOut) return;

        setShowProfileMenu(false);

        try {

            setLoggingOut(true);

            const result = await logout();

            /*
                AuthContext logout() normally doesn't
                return an error. This extra check keeps
                the Sidebar safe if we later modify it.
            */

            if (result?.error) {

                console.error(
                    "Logout error:",
                    result.error
                );

                alert(
                    "Unable to logout. Please try again."
                );

                return;
            }


            /*
                Supabase auth state changes automatically.
                ProtectedRoute will then redirect the
                user to /login.
            */

            navigate(
                "/login",
                { replace: true }
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            alert(
                "Unable to logout. Please try again."
            );

        } finally {

            setLoggingOut(false);
        }
    };


    /* =====================================================
       RETURN
    ===================================================== */

    return (

        <aside
            className={`sidebar ${
                collapsed ? "collapsed" : ""
            }`}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="sidebarHeader">

                <button
                    className="menuBtn"
                    type="button"
                    onClick={() => {

                        setCollapsed(
                            (previous) =>
                                !previous
                        );

                        setShowProfileMenu(false);

                    }}
                    aria-label="Toggle Sidebar"
                >
                    <FiMenu size={20} />
                </button>


                {!collapsed && (

                    <h2 className="sidebarTitle">

                        {profile.name ||
                            user?.user_metadata
                                ?.full_name ||
                            "Kartik"}

                    </h2>

                )}

            </div>


            {/* =================================================
                NEW CHAT
            ================================================= */}

            <button
                className="newChat"
                type="button"
                onClick={handleNewChat}
            >

                <FiPlus size={18} />

                {!collapsed && (
                    <span>
                        New Chat
                    </span>
                )}

            </button>


            {/* =================================================
                CHAT HISTORY
            ================================================= */}

            <div className="history">

                {/* EMPTY HISTORY */}

                {chats.length === 0 &&
                    !collapsed && (

                        <p
                            className="emptyHistory"
                            style={{
                                fontSize: "14px",
                                fontWeight: "400",
                            }}
                        >
                            No Chats Yet
                        </p>

                    )}


                {/* CHAT LIST */}

                {chats.map((chat) => (

                    <div
                        key={chat.id}
                        className={`historyItem ${
                            currentChatId ===
                            chat.id
                                ? "active"
                                : ""
                        }`}
                    >

                        {/* CHAT */}

                        <button
                            className="historyChatButton"
                            type="button"
                            onClick={() =>
                                handleOpenChat(
                                    chat.id
                                )
                            }
                        >

                            <FiMessageSquare
                                size={17}
                            />

                            {!collapsed && (

                                <span
                                    className="historyTitle"
                                    style={{
                                        fontSize:
                                            "15px",
                                        fontWeight:
                                            "400",
                                        lineHeight:
                                            "1.4",
                                    }}
                                >
                                    {chat.title ||
                                        "New Chat"}
                                </span>

                            )}

                        </button>


                        {/* DELETE */}

                        {!collapsed && (

                            <button
                                className="deleteChatBtn"
                                type="button"
                                onClick={(event) =>
                                    handleDeleteChat(
                                        event,
                                        chat.id
                                    )
                                }
                                aria-label="Delete chat"
                            >

                                <FiTrash2
                                    size={15}
                                />

                            </button>

                        )}

                    </div>

                ))}

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="sidebarFooter">


                {/* =================================================
                    SETTINGS
                ================================================= */}

                <button
                    className={`historyItem ${
                        location.pathname ===
                        "/settings"
                            ? "active"
                            : ""
                    }`}
                    type="button"
                    onClick={handleSettings}
                >

                    <FiSettings
                        size={18}
                    />

                    {!collapsed && (

                        <span
                            style={{
                                fontSize:
                                    "15px",
                                fontWeight:
                                    "400",
                            }}
                        >
                            Settings
                        </span>

                    )}

                </button>


                {/* =================================================
                    PROFILE
                ================================================= */}

                <div className="profileWrapper">


                    {/* PROFILE BUTTON */}

                    <button
                        className={`profileCard ${
                            showProfileMenu
                                ? "profileOpen"
                                : ""
                        }`}
                        type="button"
                        onClick={
                            toggleProfileMenu
                        }
                    >

                        <img
                            src={
                                profile.avatar ||
                                "/profile.png"
                            }
                            alt={
                                profile.name ||
                                "Profile"
                            }
                            className="profileAvatar"
                        />


                        {!collapsed && (

                            <div className="profileInfo">

                                <h3>

                                    {profile.name ||
                                        user?.user_metadata
                                            ?.full_name ||
                                        "Kartik"}

                                </h3>

                                <span>

                                    {profile.role ||
                                        "Developer"}

                                </span>

                            </div>

                        )}


                        {!collapsed && (

                            <FiChevronDown
                                size={17}
                                className={
                                    showProfileMenu
                                        ? "arrowRotate"
                                        : ""
                                }
                            />

                        )}

                    </button>


                    {/* =================================================
                        PROFILE DROP-UP
                    ================================================= */}

                    {!collapsed &&
                        showProfileMenu && (

                            <div className="profileDropdown">


                                {/* =====================================
                                    MY PROFILE
                                ===================================== */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        setShowProfileMenu(
                                            false
                                        );

                                        navigate(
                                            "/profile"
                                        );

                                    }}
                                >

                                    <FiUser
                                        size={16}
                                    />

                                    <span>
                                        My Profile
                                    </span>

                                </button>


                                {/* =====================================
                                    SETTINGS
                                ===================================== */}

                                <button
                                    type="button"
                                    onClick={
                                        handleSettings
                                    }
                                >

                                    <FiSettings
                                        size={16}
                                    />

                                    <span>
                                        Settings
                                    </span>

                                </button>


                                {/* =====================================
                                    APPEARANCE
                                ===================================== */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        setShowProfileMenu(
                                            false
                                        );

                                        navigate(
                                            "/settings"
                                        );

                                    }}
                                >

                                    <span
                                        className="profileMenuEmoji"
                                    >
                                        🎨
                                    </span>

                                    <span>
                                        Appearance
                                    </span>

                                </button>


                                {/* =====================================
                                    AI PREFERENCES
                                ===================================== */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        setShowProfileMenu(
                                            false
                                        );

                                        navigate(
                                            "/settings"
                                        );

                                    }}
                                >

                                    <FiCpu
                                        size={16}
                                    />

                                    <span>
                                        AI Preferences
                                    </span>

                                </button>


                                {/* =====================================
                                    NOTIFICATIONS
                                ===================================== */}

                                <button
                                    type="button"
                                    onClick={
                                        handleNotifications
                                    }
                                >

                                    <span
                                        className="notificationMenuIcon"
                                    >

                                        <FiBell
                                            size={16}
                                        />

                                        {unreadCount >
                                            0 && (

                                            <span
                                                className="notificationMenuBadge"
                                            >
                                                {unreadCount >
                                                9
                                                    ? "9+"
                                                    : unreadCount}
                                            </span>

                                        )}

                                    </span>

                                    <span>
                                        Notifications
                                    </span>

                                </button>


                                {/* =====================================
                                    EXPORT / SHARE
                                ===================================== */}

                                <button
                                    type="button"
                                    onClick={
                                        handleExportChats
                                    }
                                >

                                    <FiShare2
                                        size={16}
                                    />

                                    <span>
                                        Export / Share Chats
                                    </span>

                                </button>


                                {/* =====================================
                                    HELP
                                ===================================== */}

                                <button
                                    type="button"
                                    onClick={
                                        handleHelp
                                    }
                                >

                                    <FiHelpCircle
                                        size={16}
                                    />

                                    <span>
                                        Help
                                    </span>

                                </button>


                                {/* =====================================
                                    DIVIDER
                                ===================================== */}

                                <div
                                    className="profileMenuDivider"
                                />


                                {/* =====================================
                                    LOGOUT
                                ===================================== */}

                                <button
                                    type="button"
                                    className="logout"
                                    onClick={
                                        handleLogout
                                    }
                                    disabled={
                                        loggingOut
                                    }
                                >

                                    <FiLogOut
                                        size={16}
                                    />

                                    <span>

                                        {loggingOut
                                            ? "Logging out..."
                                            : "Logout"}

                                    </span>

                                </button>

                            </div>

                        )}

                </div>

            </div>

        </aside>
    );
}