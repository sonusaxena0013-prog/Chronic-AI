import { useEffect, useRef, useState } from "react";
import { useChats } from "../context/ChatContext";

export default function ChatSection() {

  const {
    chats,
    clearAllChats,
  } = useChats();

  const fileInput = useRef(null);

  const [saveHistory, setSaveHistory] = useState(
    () => JSON.parse(localStorage.getItem("saveHistory") ?? "true")
  );

  const [autoTitle, setAutoTitle] = useState(
    () => JSON.parse(localStorage.getItem("autoTitle") ?? "true")
  );

  const [autoDelete, setAutoDelete] = useState(
    () => localStorage.getItem("autoDelete") || "Never"
  );

  useEffect(() => {
    localStorage.setItem(
      "saveHistory",
      JSON.stringify(saveHistory)
    );
  }, [saveHistory]);

  useEffect(() => {
    localStorage.setItem(
      "autoTitle",
      JSON.stringify(autoTitle)
    );
  }, [autoTitle]);

  useEffect(() => {
    localStorage.setItem(
      "autoDelete",
      autoDelete
    );
  }, [autoDelete]);

  const exportChats = () => {

    const blob = new Blob(
      [JSON.stringify(chats, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "chronic-ai-chats.json";

    a.click();

    URL.revokeObjectURL(url);

  };

  const importChats = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      try {

        const imported = JSON.parse(reader.result);

        localStorage.setItem(
          "chats",
          JSON.stringify(imported)
        );

        window.location.reload();

      } catch {

        alert("Invalid chat backup.");

      }

    };

    reader.readAsText(file);

  };

  const storageSize =
    (
      new Blob([
        JSON.stringify(chats),
      ]).size / 1024
    ).toFixed(1);

  return (

    <div className="settingsSection">

      <div className="settingsCard">

        <h2>

          Chat History

        </h2>

        <p>

          Manage your conversations,
          backups and storage.

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

              onChange={()=>
                setSaveHistory(!saveHistory)
              }

            />

            <span className="slider"/>

          </label>

        </div>

        <div className="settingRow">

          <div>

            <h4>

              Auto Generate Titles

            </h4>

            <span>

              Rename chats automatically.

            </span>

          </div>

          <label className="switch">

            <input

              type="checkbox"

              checked={autoTitle}

              onChange={()=>
                setAutoTitle(!autoTitle)
              }

            />

            <span className="slider"/>

          </label>

        </div>

      </div>

      <div className="settingsCard">

        <h3>

          Auto Delete Chats

        </h3>

        <select

          className="premiumSelect"

          value={autoDelete}

          onChange={(e)=>
            setAutoDelete(e.target.value)
          }

        >

          <option>Never</option>

          <option>7 Days</option>

          <option>30 Days</option>

          <option>90 Days</option>

        </select>

      </div>

            {/* Backup */}

      <div className="settingsCard">

        <h3>

          Backup & Restore

        </h3>

        <div className="buttonRow">

          <button

            className="primaryBtn"

            onClick={exportChats}

          >

            Export Chats

          </button>

          <button

            className="secondaryBtn"

            onClick={() =>
              fileInput.current.click()
            }

          >

            Import Chats

          </button>

          <input

            ref={fileInput}

            type="file"

            accept=".json"

            hidden

            onChange={importChats}

          />

        </div>

      </div>

      {/* Storage */}

      <div className="settingsCard">

        <h3>

          Storage Usage

        </h3>

        <div className="storageBox">

          <div className="storageTop">

            <span>

              Chats Stored

            </span>

            <strong>

              {chats.length}

            </strong>

          </div>

          <div className="storageTop">

            <span>

              Storage Used

            </span>

            <strong>

              {storageSize} KB

            </strong>

          </div>

          <div className="progress">

            <div

              className="progressFill"

              style={{

                width: `${Math.min(
                  storageSize / 5,
                  100
                )}%`

              }}

            />

          </div>

        </div>

      </div>

      {/* Danger Zone */}

      <div className="settingsCard dangerCard">

        <h3>

          Danger Zone

        </h3>

        <p>

          Delete every saved
          conversation permanently.

        </p>

        <button

          className="dangerBtn"

          onClick={() => {

            if (
              window.confirm(
                "Delete all chats?"
              )
            ) {

              clearAllChats();

            }

          }}

        >

          Clear All Chats

        </button>

      </div>

    </div>

  );

}