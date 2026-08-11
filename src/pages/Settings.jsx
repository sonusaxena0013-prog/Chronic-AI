import { useState } from "react";

import SettingsSidebar from "../settings/SettingsSidebar";
import AppearanceSection from "../settings/AppearanceSection";
import ChatSection from "../settings/ChatHistorySection";
import VoiceSection from "../settings/VoiceSection";
import PrivacySection from "../settings/PrivacySection";
import AdvancedSection from "../settings/AdvancedSection";
import AboutSection from "../settings/AboutSection";

import "../styles/settings.css";


export default function Settings() {

  const [activeSection, setActiveSection] = useState("appearance");


  function renderSection() {

    switch (activeSection) {

      case "appearance":
        return <AppearanceSection />;

      case "chat":
        return <ChatSection />;

      case "voice":
        return <VoiceSection />;

      case "privacy":
        return <PrivacySection />;

      case "advanced":
        return <AdvancedSection />;

      case "about":
        return <AboutSection />;

      default:
        return <AppearanceSection />;

    }

  }


  return (

    <div className="settingsPage">


      <SettingsSidebar
        active={activeSection}
        setActive={setActiveSection}
      />


      <div className="settingsContent">


        <div className="settingsHero">

          <div>

            <h1>
              Settings
            </h1>

            <p>
              Customize your Chronic AI experience.
            </p>

          </div>


          <div className="heroBadge">

            Version 1.0

          </div>


        </div>


        <div className="settingsBody">

          {renderSection()}

        </div>


      </div>


    </div>

  );

}