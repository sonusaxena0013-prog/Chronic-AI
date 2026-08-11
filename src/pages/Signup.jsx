import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Auth.css";

export default function Signup() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!name || !email || !password) {
            setError("Please fill all fields.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        try {
            setLoading(true);

            const {
                data,
                error,
            } = await supabase.auth.signUp({
                email,
                password,

                options: {
                    data: {
                        full_name: name,
                    },
                },
            });

            if (error) {
                setError(error.message);
                return;
            }

            /*
             * If email confirmation is enabled,
             * user will need to verify email first.
             */

            if (data?.session) {
                navigate("/");
            } else {
                setSuccess(
                    "Account created! Please check your email to verify your account."
                );
            }

        } catch (err) {
            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="authPage">

            <div className="authCard">

                <div className="authLogo">
                    <div className="authLogoIcon">
                        C
                    </div>

                    <span>Chronic AI</span>
                </div>


                <div className="authHeader">

                    <h1>Create account</h1>

                    <p>
                        Create your Chronic AI account
                    </p>

                </div>


                <form
                    className="authForm"
                    onSubmit={handleSignup}
                >

                    <div className="authField">

                        <label>
                            Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Enter your name"
                            autoComplete="name"
                        />

                    </div>


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
                            placeholder="Create a password"
                            autoComplete="new-password"
                        />

                    </div>


                    {error && (
                        <div className="authError">
                            {error}
                        </div>
                    )}


                    {success && (
                        <div className="authSuccess">
                            {success}
                        </div>
                    )}


                    <button
                        type="submit"
                        className="authButton"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create account"}
                    </button>

                </form>


                <div className="authSwitch">

                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Sign in
                    </Link>

                </div>

            </div>

        </div>
    );
}