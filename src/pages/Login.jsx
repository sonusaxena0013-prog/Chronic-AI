import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Auth.css";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [error, setError] = useState("");

    /* =====================================================
       EMAIL + PASSWORD LOGIN
    ===================================================== */

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            const { error } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            if (error) {
                setError(error.message);
                return;
            }

            navigate("/");
        } catch (err) {
            console.error("Login error:", err);

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       GITHUB LOGIN
    ===================================================== */

    const handleGitHubLogin = async () => {
        setError("");

        try {
            setGithubLoading(true);

            const { error } =
                await supabase.auth.signInWithOAuth({
                    provider: "github",
                    options: {
                        redirectTo: window.location.origin,
                    },
                });

            if (error) {
                console.error(
                    "GitHub login error:",
                    error
                );

                setError(error.message);
                setGithubLoading(false);
            }
        } catch (err) {
            console.error(
                "GitHub OAuth error:",
                err
            );

            setError(
                "Unable to continue with GitHub."
            );

            setGithubLoading(false);
        }
    };

    /* =====================================================
       GOOGLE LOGIN
    ===================================================== */

    const handleGoogleLogin = async () => {
        setError("");

        try {
            setGoogleLoading(true);

            const { error } =
                await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: window.location.origin,
                    },
                });

            if (error) {
                console.error(
                    "Google login error:",
                    error
                );

                setError(error.message);
                setGoogleLoading(false);
            }
        } catch (err) {
            console.error(
                "Google OAuth error:",
                err
            );

            setError(
                "Unable to continue with Google."
            );

            setGoogleLoading(false);
        }
    };

    return (
        <div className="authPage">

            <div className="authCard">

                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="authLogo">

                    <div className="authLogoIcon">
                        C
                    </div>

                    <span>
                        Chronic AI
                    </span>

                </div>


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="authHeader">

                    <h1>
                        Welcome back
                    </h1>

                    <p>
                        Login to continue to Chronic AI
                    </p>

                </div>


                {/* =================================================
                    GOOGLE LOGIN
                ================================================= */}

                <button
  type="button"
  className="oauth-button google-button"
  onClick={handleGoogleLogin}
>
  <svg
    className="google-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fill="#4285F4"
      d="M21.35 12.27c0-.68-.06-1.34-.17-1.97H12v3.73h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.21 2.91-7.15Z"
    />
    <path
      fill="#34A853"
      d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
    />
    <path
      fill="#FBBC05"
      d="M6.54 13.84a5.86 5.86 0 0 1 0-3.68V7.63H3.3a9.75 9.75 0 0 0 0 8.74l3.24-2.53Z"
    />
    <path
      fill="#EA4335"
      d="M12 6.13c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.25 14.63 2.25 12 2.25A9.75 9.75 0 0 0 3.3 7.63l3.24 2.53C7.31 7.85 9.46 6.13 12 6.13Z"
    />
  </svg>

  <span>Continue with Google</span>
</button>


                {/* =================================================
                    GITHUB LOGIN
                ================================================= */}

                <button
                    type="button"
                    className="githubButton"
                    onClick={handleGitHubLogin}
                    disabled={
                        loading ||
                        githubLoading ||
                        googleLoading
                    }
                >

                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.466-1.11-1.466-.908-.621.069-.608.069-.608 1.004.071 1.532 1.031 1.532 1.031.892 1.529 2.341 1.087 2.91.831.091-.647.35-1.087.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.58 9.58 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.335-.012 2.411-.012 2.739 0 .267.18.578.688.48A10.003 10.003 0 0 0 22 12C22 6.477 17.523 2 12 2Z" />
                    </svg>

                    {githubLoading
                        ? "Connecting..."
                        : "Continue with GitHub"}

                </button>


                {/* =================================================
                    DIVIDER
                ================================================= */}

                <div className="authDivider">

                    <span>
                        OR
                    </span>

                </div>


                {/* =================================================
                    EMAIL LOGIN
                ================================================= */}

                <form
                    className="authForm"
                    onSubmit={handleLogin}
                >

                    <div className="authField">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                        />

                    </div>


                    <div className="authField">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />

                    </div>


                    {error && (
                        <div className="authError">
                            {error}
                        </div>
                    )}


                    <button
                        type="submit"
                        className="authButton"
                        disabled={
                            loading ||
                            githubLoading ||
                            googleLoading
                        }
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in"}
                    </button>

                </form>


                {/* =================================================
                    SIGNUP
                ================================================= */}

                <div className="authSwitch">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/signup">
                        Create account
                    </Link>

                </div>

            </div>

        </div>
    );
}
