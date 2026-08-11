import { BsRobot } from "react-icons/bs";

export default function TypingIndicator() {
  return (
    <div className="messageRow ai">
      <div className="avatar">
        <BsRobot />
      </div>

      <div className="typingBubble">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}