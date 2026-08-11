import { useEffect, useState } from "react";

export default function AdvancedSection() {

  const [streaming, setStreaming] = useState(
    () => JSON.parse(localStorage.getItem("adv_streaming") ?? "true")
  );

  const [markdown, setMarkdown] = useState(
    () => JSON.parse(localStorage.getItem("adv_markdown") ?? "true")
  );

  const [codeHighlight, setCodeHighlight] = useState(
    () => JSON.parse(localStorage.getItem("adv_codeHighlight") ?? "true")
  );

  const [autoScroll, setAutoScroll] = useState(
    () => JSON.parse(localStorage.getItem("adv_autoScroll") ?? "true")
  );

  const [developerMode, setDeveloperMode] = useState(
    () => JSON.parse(localStorage.getItem("adv_developerMode") ?? "false")
  );

  useEffect(() => {
    localStorage.setItem(
      "adv_streaming",
      JSON.stringify(streaming)
    );
  }, [streaming]);

  useEffect(() => {
    localStorage.setItem(
      "adv_markdown",
      JSON.stringify(markdown)
    );
  }, [markdown]);

  useEffect(() => {
    localStorage.setItem(
      "adv_codeHighlight",
      JSON.stringify(codeHighlight)
    );
  }, [codeHighlight]);

  useEffect(() => {
    localStorage.setItem(
      "adv_autoScroll",
      JSON.stringify(autoScroll)
    );
  }, [autoScroll]);

  useEffect(() => {
    localStorage.setItem(
      "adv_developerMode",
      JSON.stringify(developerMode)
    );
  }, [developerMode]);

  return (

    <div className="settingsSection">

      <div className="settingsCard">

        <h2>

          Advanced

        </h2>

        <p>

          Configure advanced application behaviour.

        </p>

      </div>

      <div className="settingsCard">

        <div className="settingRow">

          <div>

            <h4>

              Streaming Responses

            </h4>

            <span>

              Show AI response while it is generating.

            </span>

          </div>

          <label className="switch">

            <input
              type="checkbox"
              checked={streaming}
              onChange={() =>
                setStreaming(!streaming)
              }
            />

            <span className="slider"/>

          </label>

        </div>

        <div className="settingRow">

          <div>

            <h4>

              Markdown Rendering

            </h4>

            <span>

              Display formatted Markdown output.

            </span>

          </div>

          <label className="switch">

            <input
              type="checkbox"
              checked={markdown}
              onChange={() =>
                setMarkdown(!markdown)
              }
            />

            <span className="slider"/>

          </label>

        </div>

      </div>

    </div>

  );
}