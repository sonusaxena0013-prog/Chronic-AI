import {
  FiMonitor,
  FiMessageSquare,
  FiMic,
  FiShield,
  FiCpu,
  FiInfo,
} from "react-icons/fi";
const menu = [
  {
    id: "appearance",
    icon: <FiMonitor />,
    title: "Appearance",
    desc: "Theme & UI",
  },
    {
    id: "chat",
    icon: <FiMessageSquare />,
    title: "Chat History",
    desc: "History & Export",
  },
  {
    id: "privacy",
    icon: <FiShield />,
    title: "Data & Privacy",
    desc: "Security & Data",
  },
  {
    id: "advanced",
    icon: <FiCpu />,
    title: "Advanced",
    desc: "Performance",
  },
  {
    id: "about",
    icon: <FiInfo />,
    title: "About",
    desc: "Version & Info",
  },
];

export default function SettingsSidebar({
  active,
  setActive,
}) {

  return (

    <aside className="settingsSidebar">

      <div className="settingsLogo">

        <div className="settingsLogoIcon">

          C

        </div>

        <div>

          <h2>Chronic AI</h2>

          <span>Premium Settings</span>

        </div>

      </div>

      <nav className="settingsNav">

        {menu.map((item) => (

          <button

            key={item.id}

            onClick={() => setActive(item.id)}

            className={`settingsNavItem ${
              active === item.id ? "active" : ""
            }`}

          >

            <div className="settingsNavIcon">

              {item.icon}

            </div>

            <div>

              <h4>{item.title}</h4>

              <p>{item.desc}</p>

            </div>

          </button>

        ))}

      </nav>

      <div className="settingsSidebarFooter">

        <div className="footerCard">

          <div className="statusDot"></div>

          <div>

            <h4>System Status</h4>

            <span>Everything working</span>

          </div>

        </div>

      </div>

    </aside>

  );

}