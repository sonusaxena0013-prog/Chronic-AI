import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiSearch,
  FiChevronDown,
  FiX,
  FiBell,
  FiCheck,
} from "react-icons/fi";

import { useNotifications } from "../../context/NotificationContext";

import "../../styles/navbar.css";

export default function Navbar() {
  /* =====================================================
     NAVIGATION
  ===================================================== */

  const navigate = useNavigate();

  /* =====================================================
     SEARCH
  ===================================================== */

  const [searchQuery, setSearchQuery] = useState("");

  /* =====================================================
     MODEL MENU
  ===================================================== */

  const [showModelMenu, setShowModelMenu] = useState(false);

  /* =====================================================
     REFS
  ===================================================== */

  const modelRef = useRef(null);
  const notificationRef = useRef(null);

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const {
    notifications,
    unreadCount,
    isNotificationOpen,
    openNotifications,
    closeNotifications,
    toggleNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  /* =====================================================
     HOME
  ===================================================== */

  const handleHome = () => {
    setShowModelMenu(false);
    closeNotifications();
    navigate("/");
  };

  /* =====================================================
     OUTSIDE CLICK
  ===================================================== */

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        modelRef.current &&
        !modelRef.current.contains(event.target)
      ) {
        setShowModelMenu(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        closeNotifications();
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [closeNotifications]);

  /* =====================================================
     NOTIFICATION CLICK
  ===================================================== */

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
  };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <header className="navbar">
      {/* =================================================
          LEFT — CHRONIC AI BRAND
      ================================================= */}

      <div className="navbarLeft">
        <button
          className="navbarBrand"
          type="button"
          onClick={handleHome}
          aria-label="Go to Chronic AI Home"
        >
          <span className="navbarBrandText">
            Chronic
          </span>

          <span className="navbarBrandAI">
            AI
          </span>
        </button>
      </div>

      {/* =================================================
          CENTER — SEARCH
      ================================================= */}

      <div className="navbarCenter">
        <div className="searchBox">
          <FiSearch
            size={18}
            className="searchIcon"
          />

          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
          />

          {searchQuery.length > 0 && (
            <button
              className="searchClear"
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {/* =================================================
          RIGHT
      ================================================= */}

      <div className="navbarRight">
        {/* =================================================
            MODEL BUTTON
        ================================================= */}

        <div
          className="modelWrapper"
          ref={modelRef}
        >
          <button
            className="modelBtn"
            type="button"
            onClick={() =>
              setShowModelMenu((previous) => !previous)
            }
            aria-expanded={showModelMenu}
          >
            <span>CRO-1</span>

            <FiChevronDown
              size={15}
              className={
                showModelMenu
                  ? "modelArrowOpen"
                  : ""
              }
            />
          </button>

          {/* =================================================
              MODEL DROPDOWN
          ================================================= */}

          {showModelMenu && (
            <div className="modelMenu">
              <div className="menuHeading">
                Current Model
              </div>

              <div className="modelActive">
                <span>🤖 CRO-1 Stable</span>

                <small>Active</small>
              </div>

              <div className="menuDivider" />

              <p className="modelInfo">
                Optimized for coding, reasoning,
                research, conversations and
                streaming responses.
              </p>

              <div className="menuDivider" />

              <div className="comingSoon">
                🚀 More AI models coming soon.
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            NOTIFICATION BELL
        ================================================= */}

        <div
          className="notificationWrapper"
          ref={notificationRef}
        >
          <button
            className={`notificationBtn ${
              isNotificationOpen
                ? "notificationBtnActive"
                : ""
            }`}
            type="button"
            onClick={toggleNotifications}
            aria-label="Notifications"
            aria-expanded={isNotificationOpen}
          >
            <FiBell size={19} />

            {unreadCount > 0 && (
              <span className="notificationBadge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {/* =================================================
              NOTIFICATION PANEL
          ================================================= */}

          {isNotificationOpen && (
            <div className="notificationPanel">
              {/* HEADER */}

              <div className="notificationHeader">
                <div>
                  <h3>Notifications</h3>

                  <span>
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${
                          unreadCount === 1
                            ? ""
                            : "s"
                        }`
                      : "You're all caught up"}
                  </span>
                </div>

                {unreadCount > 0 && (
                  <button
                    className="markAllBtn"
                    type="button"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* LIST */}

              <div className="notificationList">
                {notifications.length === 0 ? (
                  <div className="emptyNotifications">
                    <div className="emptyNotificationIcon">
                      <FiBell size={21} />
                    </div>

                    <h4>No notifications</h4>

                    <p>
                      You're all caught up.
                    </p>
                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className={`notificationItem ${
                          !notification.read
                            ? "notificationUnread"
                            : ""
                        }`}
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                      >
                        {/* ICON */}

                        <div
                          className={`notificationIcon notificationIcon-${notification.type}`}
                        >
                          {notification.icon}
                        </div>

                        {/* CONTENT */}

                        <div className="notificationContent">
                          <div className="notificationTitleRow">
                            <h4>
                              {notification.title}
                            </h4>

                            <span>
                              {notification.time}
                            </span>
                          </div>

                          <p>
                            {notification.message}
                          </p>
                        </div>

                        {/* UNREAD */}

                        {!notification.read && (
                          <span className="unreadDot" />
                        )}
                      </button>
                    )
                  )
                )}
              </div>

              {/* FOOTER */}

              <div className="notificationFooter">
                <button
                  type="button"
                  onClick={markAllAsRead}
                >
                  <FiCheck size={14} />

                  <span>
                    Mark notifications as read
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            MINI CHRONIC AI LOGO
        ================================================= */}

        <button
          className="brandButton"
          type="button"
          onClick={handleHome}
          aria-label="Go to Chronic AI Home"
        >
          <img
            src="/chronic-logo.png"
            alt="Chronic AI"
            className="navbarMiniLogo"
          />
        </button>
      </div>
    </header>
  );
}