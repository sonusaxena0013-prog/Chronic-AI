import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext(null);

/* =====================================================
   EMPTY PROFILE
===================================================== */

const EMPTY_PROFILE = {
    id: "",
    name: "User",
    username: "@user",
    role: "user",
    bio: "",
    image: "",
};

/* =====================================================
   CREATE USERNAME
===================================================== */

function createUsername(name, userId = "") {

    const cleanName = String(name || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 18);

    const shortId = String(userId || "")
        .replace(/-/g, "")
        .slice(0, 6)
        .toLowerCase();

    const base = cleanName || "user";

    return `@${base}${shortId ? `_${shortId}` : ""}`;
}

/* =====================================================
   GET USER NAME
===================================================== */

function getUserName(user) {

    const metadata = user?.user_metadata || {};

    return (
        metadata.full_name ||
        metadata.name ||
        metadata.user_name ||
        metadata.preferred_username ||
        user?.email
            ?.split("@")[0]
            ?.replace(/[._-]/g, " ")
            ?.replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            ) ||
        "User"
    );
}

/* =====================================================
   PROVIDER
===================================================== */

export function ProfileProvider({ children }) {

    /* =================================================
       AUTH
    ================================================= */

    const {
        user,
        loading: authLoading,
    } = useAuth();

    /* =================================================
       STATE
    ================================================= */

    const [profile, setProfile] =
        useState(EMPTY_PROFILE);

    const [loading, setLoading] =
        useState(true);

    /* =================================================
       LOAD PROFILE
    ================================================= */

    useEffect(() => {

        let mounted = true;

        const loadProfile = async () => {

            /* -----------------------------------------
               WAIT FOR AUTH
            ----------------------------------------- */

            if (authLoading) {
                return;
            }

            /* -----------------------------------------
               NO USER
            ----------------------------------------- */

            if (!user) {

                if (mounted) {

                    setProfile(EMPTY_PROFILE);

                    setLoading(false);

                }

                return;
            }

            /* -----------------------------------------
               IMPORTANT:
               CLEAR OLD USER PROFILE IMMEDIATELY
            ----------------------------------------- */

            if (mounted) {

                setProfile(EMPTY_PROFILE);

                setLoading(true);

            }

            const userId = user.id;

            /* -----------------------------------------
               USER NAME
            ----------------------------------------- */

            const name =
                getUserName(user);

            /* -----------------------------------------
               FIRST TRY:
               FETCH EXISTING PROFILE
            ----------------------------------------- */

            const {
                data,
                error,
            } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .maybeSingle();

            /* -----------------------------------------
               FETCH ERROR
            ----------------------------------------- */

            if (error) {

                console.error(
                    "Profile loading error:",
                    error
                );

                if (mounted) {

                    setProfile({
                        id: userId,
                        name,
                        username:
                            createUsername(
                                name,
                                userId
                            ),
                        role: "user",
                        bio: "",
                        image: "",
                    });

                    setLoading(false);

                }

                return;
            }

            /* -----------------------------------------
               PROFILE DOES NOT EXIST
            ----------------------------------------- */

            if (!data) {

                const username =
                    createUsername(
                        name,
                        userId
                    );

                const newProfile = {

                    id: userId,

                    name,

                    username,

                    role: "user",

                    bio: "",

                    image: "",

                };

                const {
                    data: createdProfile,
                    error: createError,
                } = await supabase
                    .from("profiles")
                    .insert(newProfile)
                    .select()
                    .single();

                /* -------------------------------------
                   PROFILE CREATION ERROR
                ------------------------------------- */

                if (createError) {

                    console.error(
                        "Profile creation error:",
                        createError
                    );

                    /*
                     * Don't show another user's
                     * profile here.
                     */

                    if (mounted) {

                        setProfile({
                            ...newProfile,
                        });

                        setLoading(false);

                    }

                    return;
                }

                /* -------------------------------------
                   CREATED SUCCESSFULLY
                ------------------------------------- */

                if (mounted) {

                    setProfile({
                        ...EMPTY_PROFILE,
                        ...createdProfile,
                    });

                    setLoading(false);

                }

                return;
            }

            /* -----------------------------------------
               EXISTING PROFILE FOUND
            ----------------------------------------- */

            if (mounted) {

                /*
                 * Make absolutely sure this profile
                 * belongs to the currently logged-in
                 * Supabase user.
                 */

                if (data.id !== userId) {

                    console.error(
                        "Profile ID mismatch:",
                        {
                            profileId: data.id,
                            userId,
                        }
                    );

                    setProfile({
                        ...EMPTY_PROFILE,
                        id: userId,
                        name,
                        username:
                            createUsername(
                                name,
                                userId
                            ),
                    });

                    setLoading(false);

                    return;
                }

                setProfile({

                    ...EMPTY_PROFILE,

                    ...data,

                    id: userId,

                });

                setLoading(false);

            }

        };

        loadProfile();

        return () => {

            mounted = false;

        };

    }, [user, authLoading]);

    /* =================================================
       UPDATE PROFILE
    ================================================= */

    const updateProfile = async (updates) => {

        if (!user?.id) {

            console.error(
                "Cannot update profile: no user"
            );

            return;

        }

        const userId = user.id;

        const updatedProfile = {

            ...profile,

            ...updates,

            id: userId,

        };

        /* ---------------------------------------------
           DATABASE UPDATE
        --------------------------------------------- */

        const {
            data,
            error,
        } = await supabase
            .from("profiles")
            .update({

                name:
                    updatedProfile.name,

                username:
                    updatedProfile.username,

                bio:
                    updatedProfile.bio,

                image:
                    updatedProfile.image,

                updated_at:
                    new Date().toISOString(),

            })
            .eq("id", userId)
            .select()
            .single();

        /* ---------------------------------------------
           ERROR
        --------------------------------------------- */

        if (error) {

            console.error(
                "Profile update error:",
                error
            );

            return;

        }

        /* ---------------------------------------------
           LOCAL STATE
        --------------------------------------------- */

        setProfile({

            ...EMPTY_PROFILE,

            ...data,

            id: userId,

        });

        /* ---------------------------------------------
           SIDEBAR SYNC
        --------------------------------------------- */

        window.dispatchEvent(
            new Event("profileUpdated")
        );

    };

    /* =================================================
       UPDATE NAME
    ================================================= */

    const updateName = async (name) => {

        const cleanName =
            String(name || "").trim();

        const finalName =
            cleanName || "User";

        await updateProfile({

            name: finalName,

            username:
                createUsername(
                    finalName,
                    user?.id
                ),

        });

    };

    /* =================================================
       UPDATE IMAGE
    ================================================= */

    const updateImage = async (image) => {

        await updateProfile({

            image:
                image || "",

        });

    };

    /* =================================================
       PROVIDER
    ================================================= */

    return (

        <ProfileContext.Provider
            value={{

                profile,

                setProfile,

                updateProfile,

                updateName,

                updateImage,

                loading,

            }}
        >

            {children}

        </ProfileContext.Provider>

    );

}

/* =====================================================
   HOOK
===================================================== */

export function useProfile() {

    const context =
        useContext(ProfileContext);

    if (!context) {

        throw new Error(
            "useProfile must be used inside ProfileProvider"
        );

    }

    return context;

}