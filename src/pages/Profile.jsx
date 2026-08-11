import { useEffect, useRef, useState } from "react";

import {
    FiCamera,
    FiEdit3,
    FiUser,
    FiActivity,
    FiMail,
    FiCalendar,
    FiShield,
    FiCpu,
    FiClock,
    FiX,
    FiCheck,
} from "react-icons/fi";

import "../styles/profile.css";

import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";


/* =====================================================
   PROFILE PAGE
===================================================== */

export default function Profile() {

    /* =================================================
       CONTEXT
    ================================================= */

    const {
        profile,
        updateProfile,
        updateName,
        updateImage,
        loading: profileLoading,
    } = useProfile();

    const {
        user,
    } = useAuth();


    /* =================================================
       REFS
    ================================================= */

    const fileInputRef =
        useRef(null);


    /* =================================================
       EDITING
    ================================================= */

    const [editing, setEditing] =
        useState(false);


    const [form, setForm] =
        useState(profile);


    /* =================================================
       AVATAR PREVIEW
    ================================================= */

    const [
        showAvatarPreview,
        setShowAvatarPreview,
    ] = useState(false);


    /* =================================================
       KEEP FORM IN SYNC
    ================================================= */

    useEffect(() => {

        setForm(profile);

    }, [profile]);


    /* =================================================
       PROFILE LOADING
    ================================================= */

    if (profileLoading) {

        return (

            <div className="profilePage">

                <div className="profileLoading">

                    Loading profile...

                </div>

            </div>

        );

    }


    /* =================================================
       USER EMAIL
    ================================================= */

    const email =
        user?.email ||
        "Not connected";


    /* =================================================
       JOINED YEAR
    ================================================= */

    const joinedYear =
        user?.created_at
            ? new Date(
                user.created_at
            ).getFullYear()
            : "2026";


    /* =================================================
       PROFILE VALUES
    ================================================= */

    const name =
        profile?.name ||
        "User";


    const username =
        profile?.username ||
        "@user";


    const role =
        profile?.role ||
        "user";


    const bio =
        profile?.bio ||
        "";


    const avatar =
        profile?.image ||
        "";


    /* =================================================
       OPEN EDITOR
    ================================================= */

    function openEditor() {

        setForm({

            ...profile,

        });

        setEditing(true);

    }


    /* =================================================
       CLOSE EDITOR
    ================================================= */

    function closeEditor() {

        setForm({

            ...profile,

        });

        setEditing(false);

    }


    /* =================================================
       FORM CHANGE
    ================================================= */

    function handleChange(e) {

        const {
            name,
            value,
        } = e.target;


        setForm((prev) => ({

            ...prev,

            [name]: value,

        }));

    }


    /* =================================================
       SAVE PROFILE
    ================================================= */

    async function saveProfile() {

        const cleanName =
            String(
                form.name || ""
            ).trim() || "User";


        let cleanUsername =
            String(
                form.username || ""
            ).trim();


        if (!cleanUsername) {

            cleanUsername =
                `@${cleanName
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]+/g,
                        ""
                    )}`;

        }


        if (
            !cleanUsername.startsWith("@")
        ) {

            cleanUsername =
                `@${cleanUsername}`;

        }


        await updateProfile({

            name:
                cleanName,

            username:
                cleanUsername,

            /*
             * IMPORTANT:
             * Role database se aayega.
             *
             * Existing Developer account
             * Developer hi rahega.
             *
             * New accounts ka role
             * user hi rahega.
             */
            role:
                profile.role || "user",

            bio:
                form.bio || "",

            image:
                form.image || "",

        });


        setEditing(false);

    }


    /* =================================================
       CHOOSE IMAGE
    ================================================= */

    function chooseImage() {

        fileInputRef.current?.click();

    }


    /* =================================================
       IMAGE CHANGE
    ================================================= */

    async function handleImageChange(e) {

        const file =
            e.target.files?.[0];


        if (!file) return;


        /* IMAGE CHECK */

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select an image file."
            );

            e.target.value = "";

            return;

        }


        /* 5 MB LIMIT */

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            alert(
                "Image should be smaller than 5 MB."
            );

            e.target.value = "";

            return;

        }


        const reader =
            new FileReader();


        reader.onload = async () => {

            const image =
                reader.result;


            await updateImage(
                image
            );


            setForm((prev) => ({

                ...prev,

                image,

            }));

        };


        reader.readAsDataURL(file);


        e.target.value = "";

    }


    /* =================================================
       REMOVE AVATAR
    ================================================= */

    async function removeAvatar() {

        await updateImage("");

        setForm((prev) => ({

            ...prev,

            image: "",

        }));

    }


    /* =================================================
       RETURN
    ================================================= */

    return (

        <div className="profilePage">


            {/* =================================================
                PROFILE HERO
            ================================================= */}

            <section className="profileHero">


                {/* COVER */}

                <div className="profileCover">

                    <div className="coverGlow coverGlowOne" />

                    <div className="coverGlow coverGlowTwo" />

                </div>


                {/* HERO CONTENT */}

                <div className="profileHeroContent">


                    {/* =================================================
                        AVATAR
                    ================================================= */}

                    <div className="profileAvatarWrapper">


                        <button
                            type="button"
                            className="profileAvatarButton"
                            onClick={() => {

                                if (avatar) {

                                    setShowAvatarPreview(
                                        true
                                    );

                                }

                            }}
                            aria-label="Preview profile picture"
                            title={
                                avatar
                                    ? "Click to preview"
                                    : "No profile picture"
                            }
                        >

                            {avatar ? (

                                <img
                                    src={avatar}
                                    alt={name}
                                    className="profileMainAvatar"
                                />

                            ) : (

                                <div className="profileAvatarFallback">

                                    {name
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>

                            )}

                        </button>


                        {/* CAMERA */}

                        <button
                            type="button"
                            className="avatarCameraBtn"
                            onClick={chooseImage}
                            title="Change profile picture"
                            aria-label="Change profile picture"
                        >

                            <FiCamera size={14} />

                        </button>


                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={
                                handleImageChange
                            }
                        />

                    </div>


                    {/* =================================================
                        IDENTITY
                    ================================================= */}

                    <div className="profileIdentity">

                        <div className="profileNameRow">

                            <h1>
                                {name}
                            </h1>


                            <span className="profileRole">

                                {role}

                            </span>

                        </div>


                        <div className="profileUsername">

                            {username}

                        </div>


                        <p>

                            {bio ||
                                "Welcome to your Chronic AI workspace."}

                        </p>

                    </div>


                    {/* EDIT */}

                    <button
                        type="button"
                        className="editProfileBtn"
                        onClick={openEditor}
                    >

                        <FiEdit3 size={15} />

                        Edit Profile

                    </button>

                </div>

            </section>


            {/* =================================================
                TOP INFORMATION
            ================================================= */}

            <div className="profileGrid topGrid">


                {/* ABOUT */}

                <section className="profileCard aboutCard">

                    <div className="cardLabel">

                        PROFILE

                    </div>


                    <div className="cardMainRow">

                        <div className="profileCardIcon">

                            <FiUser />

                        </div>


                        <div>

                            <h2>
                                About Me
                            </h2>


                            <p>

                                {bio ||
                                    "Welcome to my Chronic AI workspace. This profile contains my basic account information and preferences."}

                            </p>

                        </div>

                    </div>

                </section>


                {/* ACCOUNT STATUS */}

                <section className="profileCard statusCard">

                    <div className="cardLabel">

                        ACCOUNT STATUS

                    </div>


                    <div className="cardMainRow">

                        <div className="profileCardIcon statusIcon">

                            <FiActivity />

                        </div>


                        <div>

                            <h2>

                                Everything looks good

                            </h2>


                            <p>

                                Your Chronic AI profile is active and ready to use.

                            </p>


                            <div className="activeStatus">

                                <span />

                                Active

                            </div>

                        </div>

                    </div>

                </section>

            </div>


            {/* =================================================
                LOWER GRID
            ================================================= */}

            <div className="profileGrid bottomGrid">


                {/* PERSONAL INFORMATION */}

                <section className="profileCard personalCard">

                    <div className="cardLabel">

                        ACCOUNT

                    </div>


                    <h2>

                        Personal Information

                    </h2>


                    <div className="infoGrid">


                        <InfoBox
                            icon={<FiUser />}
                            label="Full Name"
                            value={name}
                        />


                        <InfoBox
                            icon={<FiMail />}
                            label="Email"
                            value={email}
                        />


                        <InfoBox
                            icon={<FiCalendar />}
                            label="Joined"
                            value={joinedYear}
                        />


                        <InfoBox
                            icon={<FiShield />}
                            label="Account"
                            value="Active"
                            active
                        />

                    </div>

                </section>


                {/* PROFILE OVERVIEW */}

                <section className="profileCard overviewCard">

                    <div className="cardLabel">

                        OVERVIEW

                    </div>


                    <h2>

                        Your Profile

                    </h2>


                    <div className="overviewStats">


                        <StatBox
                            icon={<FiCpu />}
                            value="AI"
                            label="Assistant"
                        />


                        <StatBox
                            icon={<FiCpu />}
                            value="CRO-1"
                            label="Model"
                        />


                        <StatBox
                            icon={<FiClock />}
                            value="ON"
                            label="History"
                        />

                    </div>

                </section>

            </div>


            {/* =================================================
                AVATAR PREVIEW
            ================================================= */}

            {showAvatarPreview &&
                avatar && (

                    <div
                        className="avatarPreviewOverlay"
                        onMouseDown={(e) => {

                            if (
                                e.target ===
                                e.currentTarget
                            ) {

                                setShowAvatarPreview(
                                    false
                                );

                            }

                        }}
                    >

                        <div
                            className="avatarPreviewModal"
                            onMouseDown={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <button
                                type="button"
                                className="avatarPreviewClose"
                                onClick={() =>
                                    setShowAvatarPreview(
                                        false
                                    )
                                }
                                aria-label="Close preview"
                                title="Close"
                            >

                                <FiX size={22} />

                            </button>


                            <img
                                src={avatar}
                                alt={name}
                                className="avatarPreviewImage"
                            />


                            <div className="avatarPreviewName">

                                {name}

                            </div>

                        </div>

                    </div>

                )}


            {/* =================================================
                EDIT PROFILE MODAL
            ================================================= */}

            {editing && (

                <div
                    className="profileModalOverlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {

                            closeEditor();

                        }

                    }}
                >

                    <div className="profileModal">


                        {/* HEADER */}

                        <div className="modalHeader">

                            <div>

                                <span>
                                    PROFILE
                                </span>

                                <h2>
                                    Edit Profile
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="modalCloseBtn"
                                onClick={closeEditor}
                                aria-label="Close"
                            >

                                <FiX />

                            </button>

                        </div>


                        {/* AVATAR */}

                        <div className="modalAvatarArea">

                            <div className="modalAvatar">

                                {form.image ? (

                                    <img
                                        src={form.image}
                                        alt="Profile"
                                    />

                                ) : (

                                    <span>

                                        {(
                                            form.name ||
                                            "U"
                                        )
                                            .charAt(0)
                                            .toUpperCase()}

                                    </span>

                                )}

                            </div>


                            <div className="avatarActions">

                                <button
                                    type="button"
                                    className="changePhotoBtn"
                                    onClick={chooseImage}
                                >

                                    <FiCamera />

                                    Change Photo

                                </button>


                                {form.image && (

                                    <button
                                        type="button"
                                        className="removePhotoBtn"
                                        onClick={
                                            removeAvatar
                                        }
                                    >

                                        Remove

                                    </button>

                                )}

                            </div>

                        </div>


                        {/* FORM */}

                        <div className="profileForm">


                            {/* NAME */}

                            <label>

                                Full Name

                                <input
                                    name="name"
                                    value={
                                        form.name ||
                                        ""
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Your name"
                                />

                            </label>


                            {/* USERNAME */}

                            <label>

                                Username

                                <input
                                    name="username"
                                    value={
                                        form.username ||
                                        ""
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="@username"
                                />

                            </label>


                            {/* ROLE */}

                            <label>

                                Role

                                <input
                                    name="role"
                                    value={
                                        form.role ||
                                        "user"
                                    }
                                    readOnly
                                    disabled
                                />

                            </label>


                            {/* BIO */}

                            <label>

                                Bio

                                <textarea
                                    name="bio"
                                    value={
                                        form.bio ||
                                        ""
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={3}
                                    placeholder="Tell something about yourself..."
                                />

                            </label>

                        </div>


                        {/* ACTIONS */}

                        <div className="modalActions">

                            <button
                                type="button"
                                className="cancelBtn"
                                onClick={closeEditor}
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                className="saveProfileBtn"
                                onClick={
                                    saveProfile
                                }
                            >

                                <FiCheck />

                                Save Changes

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


/* =====================================================
   INFO BOX
===================================================== */

function InfoBox({
    icon,
    label,
    value,
    active,
}) {

    return (

        <div className="infoBox">

            <div className="infoIcon">

                {icon}

            </div>


            <div>

                <span>
                    {label}
                </span>


                <strong
                    className={
                        active
                            ? "activeText"
                            : ""
                    }
                >

                    {value}

                </strong>

            </div>

        </div>

    );

}


/* =====================================================
   STAT BOX
===================================================== */

function StatBox({
    icon,
    value,
    label,
}) {

    return (

        <div className="statBox">

            <div className="statIcon">

                {icon}

            </div>


            <strong>

                {value}

            </strong>


            <span>

                {label}

            </span>

        </div>

    );

}