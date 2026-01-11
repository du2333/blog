import type { ReactNode } from "react";

interface EmailLayoutProps {
  children: ReactNode;
  previewText?: string;
}

export const EmailLayout = ({ children, previewText }: EmailLayoutProps) => {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        margin: "0",
        padding: "0",
        width: "100%",
      }}
    >
      {previewText && (
        <div
          style={{
            display: "none",
            maxHeight: "0px",
            overflow: "hidden",
          }}
        >
          {previewText}
        </div>
      )}
      <table
        align="center"
        border={0}
        cellPadding="0"
        cellSpacing="0"
        width="100%"
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <tr>
          <td>
            <header style={{ marginBottom: "40px", textAlign: "center" }}>
              <h2
                style={{
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  fontSize: "24px",
                  fontWeight: "500",
                  margin: "0",
                  letterSpacing: "-0.01em",
                }}
              >
                Flare Stack
              </h2>
            </header>

            <main>{children}</main>

            <footer
              style={{
                marginTop: "60px",
                paddingTop: "20px",
                borderTop: "1px solid #f0f0f0",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "#999",
                  margin: "0",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                &copy; {new Date().getFullYear()} Flare Stack. Minimalist Blog
                System.
              </p>
            </footer>
          </td>
        </tr>
      </table>
    </div>
  );
};
