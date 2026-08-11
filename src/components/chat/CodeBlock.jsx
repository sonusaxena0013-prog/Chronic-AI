import { memo, useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function CodeBlock({

  language = "text",

  children,

}) {

  const [copied, setCopied] = useState(false);

  async function copyCode() {

    try {

      await navigator.clipboard.writeText(children);

      setCopied(true);

      setTimeout(() => {

        setCopied(false);

      }, 2000);

    } catch (err) {

      console.error(err);

    }

  }

  return (

    <div className="codeBlock">

      <div className="codeHeader">

        <span className="codeLanguage">

          {language}

        </span>

        <button

          className="copyCodeBtn"

          onClick={copyCode}

          type="button"

        >

          {copied ? (

            <>

              <FiCheck />

              <span>Copied</span>

            </>

          ) : (

            <>

              <FiCopy />

              <span>Copy</span>

            </>

          )}

        </button>

      </div>

      <SyntaxHighlighter

        language={language}

        style={oneDark}

        showLineNumbers

        wrapLongLines

        customStyle={{

          margin: 0,

          borderRadius: "0 0 12px 12px",

          fontSize: "14px",

          padding: "18px",

        }}

      >

        {children}

      </SyntaxHighlighter>

    </div>

  );

}

export default memo(CodeBlock);