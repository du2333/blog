import { EmailLayout } from "./EmailLayout";

interface AuthEmailProps {
  type: "verification" | "reset-password";
  url: string;
}

export const AuthEmail = ({ type, url }: AuthEmailProps) => {
  const isVerification = type === "verification";
  const title = isVerification ? "验证您的邮箱" : "重置您的密码";
  const description = isVerification
    ? "请点击下方链接以完成邮箱验证。此步骤是为了确保您的账户安全。"
    : "我们收到了重置您账户密码的请求。如果您没有发起此请求，请忽略此邮件。";
  const buttonText = isVerification ? "验证邮箱" : "重置密码";

  return (
    <EmailLayout previewText={title}>
      <h1
        style={{
          fontFamily: '"Playfair Display", "Georgia", serif',
          fontSize: "20px",
          fontWeight: "500",
          color: "#1a1a1a",
          marginBottom: "24px",
          lineHeight: "1.4",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: "14px",
          color: "#444",
          lineHeight: "1.6",
          marginBottom: "32px",
        }}
      >
        {description}
      </p>
      <div style={{ marginBottom: "32px" }}>
        <a
          href={url}
          style={{
            backgroundColor: "#1a1a1a",
            color: "#ffffff",
            padding: "12px 24px",
            textDecoration: "none",
            fontSize: "13px",
            display: "inline-block",
            letterSpacing: "0.05em",
          }}
        >
          {buttonText}
        </a>
      </div>
      <p style={{ fontSize: "12px", color: "#999", lineHeight: "1.6" }}>
        如果按钮无法点击，请复制并粘贴以下链接到浏览器：
        <br />
        <a href={url} style={{ color: "#666", wordBreak: "break-all" }}>
          {url}
        </a>
      </p>
      <p
        style={{
          fontSize: "12px",
          color: "#999",
          marginTop: "24px",
          fontStyle: "italic",
        }}
      >
        此链接将在 1 小时后过期。
      </p>
    </EmailLayout>
  );
};
