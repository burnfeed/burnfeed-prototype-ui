import React, { useEffect, useState } from "react";
import { EmojiClickData } from "emoji-picker-react";
import twemoji from "twemoji";
import dynamic from "next/dynamic";

const Picker = dynamic(
  () => {
    return import("emoji-picker-react");
  },
  { ssr: false }
);

const EmojiPicker = ({
  onChoosen,
}: {
  onChoosen: (emoji: EmojiClickData) => void;
}) => {
  const [inited, setInited] = useState(false);

  const handleEmojiClick = (emoji: EmojiClickData, event: MouseEvent) => {
    // console.log(emoji);
    onChoosen(emoji);
  };

  useEffect(() => {
    setInited(true);
  }, []);

  return (
    <div>
      <div id="emoji-picker-container"></div>
      <Picker onEmojiClick={handleEmojiClick} />
    </div>
  );
};

export default EmojiPicker;
