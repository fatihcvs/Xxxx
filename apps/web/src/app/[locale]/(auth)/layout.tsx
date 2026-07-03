import type { ReactNode } from "react";

/**
 * Auth frame: dark backdrop with the overhanging wordmark over a glossy shell —
 * the same classic skin the game uses, sized for the landing/login pages.
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="game-content" style={{ minHeight: "100vh", padding: "26px 0 40px" }}>
      <div style={{ width: "900px", maxWidth: "100%", margin: "0 auto", position: "relative", paddingTop: "34px" }}>
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <span
            style={{
              fontSize: "54px",
              fontWeight: 800,
              letterSpacing: "-2.5px",
              color: "#ffffff",
              textShadow: "2px 3px 5px rgba(0,0,0,0.65)",
            }}
          >
            fameworld
          </span>
        </div>
        <div
          style={{
            background: "linear-gradient(#d8dcdf, #c3c9cd)",
            borderRadius: "10px",
            boxShadow: "0 4px 26px rgba(0,0,0,0.55)",
            marginTop: "-28px",
            padding: "10px 12px 12px",
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
