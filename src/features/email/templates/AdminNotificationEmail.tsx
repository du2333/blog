import { EmailLayout } from "./EmailLayout";

interface AdminNotificationEmailProps {
  postTitle: string;
  commenterName: string;
  commentPreview: string;
  commentUrl: string;
}

export const AdminNotificationEmail = ({
  postTitle,
  commenterName,
  commentPreview,
  commentUrl,
}: AdminNotificationEmailProps) => {
  return (
    <EmailLayout
      previewText={`${commenterName} 在《${postTitle}》下发表了评论`}
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
        新评论提醒
      </h1>
      <p style={{ fontSize: "14px", color: "#444", lineHeight: "1.6" }}>
        <strong>{commenterName}</strong> 在《{postTitle}》下发表了评论：
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
        {commentPreview}
      </blockquote>
      <div style={{ marginTop: "32px" }}>
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
          查看评论
        </a>
      </div>
    </EmailLayout>
  );
};
