import { useEffect, useState } from "react";

export default function PrivacySection() {

  const [saveHistory, setSaveHistory] = useState(
    () => JSON.parse(localStorage.getItem("privacy_saveHistory") ?? "true")
  );

  const [analytics, setAnalytics] = useState(
    () => JSON.parse(localStorage.getItem("privacy_analytics") ?? "false")
  );

  const [cloudSync, setCloudSync] = useState(
    () => JSON.parse(localStorage.getItem("privacy_cloudSync") ?? "false")
  );

  const [rememberKey, setRememberKey] = useState(
    () => JSON.parse(localStorage.getItem("privacy_apiKey") ?? "true")
  );

  useEffect(() => {
    localStorage.setItem(
      "privacy_saveHistory",
      JSON.stringify(saveHistory)
    );
  }, [saveHistory]);

  useEffect(() => {
    localStorage.setItem(
      "privacy_analytics",
      JSON.stringify(analytics)
    );
  }, [analytics]);

  useEffect(() => {
    localStorage.setItem(
      "privacy_cloudSync",
      JSON.stringify(cloudSync)
    );
  }, [cloudSync]);

  useEffect(() => {
    localStorage.setItem(
      "privacy_apiKey",
      JSON.stringify(rememberKey)
    );
  }, [rememberKey]);

  const clearCache = () => {

    if (!window.confirm("Clear browser cache settings?"))
      return;

    localStorage.removeItem("theme");
    localStorage.removeItem("accent");
    localStorage.removeItem("radius");
    localStorage.removeItem("fontSize");

    alert("Cache cleared successfully.");

  };

  const clearStorage = () => {

    if (
      !window.confirm(
        "Delete ALL local data?"
      )
    )
      return;

    localStorage.clear();

    window.location.reload();

  };

  return (

    <div className="settingsSection">

      <div className="settingsCard">

        <h2>

          Privacy

        </h2>

        <p>

          Control your data and
          security preferences.

        </p>

      </div>

      <div className="settingsCard">

        <div className="settingRow">

          <div>

            <h4>

              Save Chat History

            </h4>

            <span>

              Store conversations locally.

            </span>

          </div>

          <label className="switch">

            <input

              type="checkbox"

              checked={saveHistory}

              onChange={() =>
                setSaveHistory(!saveHistory)
              }

            />

            <span className="slider"/>

          </label>

        </div>

        <div className="settingRow">

          <div>

            <h4>

              Anonymous Analytics

            </h4>

            <span>

              Help improve Chronic AI.

            </span>

          </div>

          <label className="switch">

            <input

              type="checkbox"

              checked={analytics}

              onChange={() =>
                setAnalytics(!analytics)
              }

            />

            <span className="slider"/>

          </label>

        </div>

                <div className="settingRow">

          <div>

            <h4>

              Cloud Sync

            </h4>

            <span>

              Sync settings across devices.

            </span>

          </div>

          <label className="switch">

            <input

              type="checkbox"

              checked={cloudSync}

              onChange={() =>
                setCloudSync(!cloudSync)
              }

            />

            <span className="slider"/>

          </label>

        </div>

        <div className="settingRow">

          <div>

            <h4>

              Remember API Key

            </h4>

            <span>

              Save your API key locally.

            </span>

          </div>

          <label className="switch">

            <input

              type="checkbox"

              checked={rememberKey}

              onChange={() =>
                setRememberKey(!rememberKey)
              }

            />

            <span className="slider"/>

          </label>

        </div>

      </div>

      {/* Data Management */}

      <div className="settingsCard">

        <h3>

          Data Management

        </h3>

        <div className="buttonRow">

          <button

            className="secondaryBtn"

            onClick={clearCache}

          >

            Clear Cache

          </button>

          <button

            className="dangerBtn"

            onClick={clearStorage}

          >

            Clear Local Storage

          </button>

        </div>

      </div>

      {/* Privacy Info */}

      <div className="settingsCard">

        <h3>

          Privacy Information

        </h3>

        <ul className="infoList">

          <li>
            ✓ Chats are stored locally on your device.
          </li>

          <li>
            ✓ No personal information is shared automatically.
          </li>

          <li>
            ✓ You can remove all local data anytime.
          </li>

        </ul>

      </div>

      {/* Reset */}

      <div className="settingsCard dangerCard">

        <h3>

          Reset Privacy Settings

        </h3>

        <p>

          Restore all privacy preferences
          to their default values.

        </p>

        <button

          className="dangerBtn"

          onClick={() => {

            setSaveHistory(true);

            setAnalytics(false);

            setCloudSync(false);

            setRememberKey(true);

          }}

        >

          Reset Privacy Settings

        </button>

      </div>

    </div>

  );

}