import { EmailLayout } from "./EmailLayout";

interface ReplyNotificationEmailProps {
  postTitle: string;
  replierName: string;
  replyPreview: string;
  commentUrl: string;
  unsubscribeUrl: string;
}

export const ReplyNotificationEmail = ({
  postTitle,
  replierName,
  replyPreview,
  commentUrl,
  unsubscribeUrl,
}: ReplyNotificationEmailProps) => {
  return (
    <EmailLayout
      previewText={`${replierName} 回复了您在《${postTitle}》下的评论`}
    >
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
        收到新的回复
      </h1>
      <p style={{ fontSize: "14px", color: "#444", lineHeight: "1.6" }}>
        <strong>{replierName}</strong> 回复了您的评论：
      </p>
      <blockquote
        style={{
          borderLeft: "2px solid #e5e5e5",
          margin: "24px 0",
          paddingLeft: "16px",
          fontStyle: "italic",
          color: "#666",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        {replyPreview}
      </blockquote>
      <div style={{ marginTop: "32px", marginBottom: "40px" }}>
        <a
          href={commentUrl}
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
          查看完整回复
        </a>
      </div>
      <div
        style={{
          paddingTop: "20px",
          borderTop: "1px solid #f9f9f9",
        }}
      >
        <p style={{ fontSize: "12px", color: "#999", margin: "0" }}>
          不想再接收此类通知？
          <a
            href={unsubscribeUrl}
            style={{
              color: "#999",
              textDecoration: "underline",
              marginLeft: "4px",
            }}
          >
            一键退订
          </a>
        </p>
      </div>
    </EmailLayout>
  );
};
