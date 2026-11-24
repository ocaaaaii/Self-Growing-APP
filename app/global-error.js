"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/reportError";

// Last-resort error page: shown when the root layout itself fails, so it
// renders its own <html>/<body> and uses no app components or providers.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    reportError(error, { source: "global" });
  }, [error]);

  return (
    <html lang="zh-Hant">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E8DCC8",
          color: "#5C4332",
          fontFamily: "'PingFang TC','Microsoft JhengHei','Noto Sans TC',sans-serif",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <div role="alert" style={{ maxWidth: 320, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, color: "#6E5340" }}>Mochi 慢慢變好</p>
          <h1 style={{ margin: "8px 0", fontSize: 20 }}>出了一點狀況</h1>
          <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.7, color: "#6E5340" }}>
            你的資料都還在。重新載入通常就會好；如果一直這樣，請稍後再試。
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: 0,
              borderRadius: 16,
              padding: "12px 24px",
              background: "#8B5E3F",
              color: "#FAF4E8",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            重新載入
          </button>
        </div>
      </body>
    </html>
  );
}
