import { useState } from "react";
import { Check, Copy, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface ShareLinkButtonProps {
  roomId: string;
}

const ShareLinkButton = ({ roomId }: ShareLinkButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/game/${roomId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-6 text-center"
    >
      <motion.button
        onClick={handleCopy}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative bg-pink-100 hover:bg-pink-200 text-pink-700 px-6 py-3 rounded-full shadow-md flex items-center gap-2 mx-auto border-2 border-pink-200"
      >
        <motion.span
          initial={false}
          animate={copied ? { opacity: 0 } : { opacity: 1 }}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </motion.span>
        {copied ? "Link Copied!" : "Share Link with Partner"}
        <Heart className="w-4 h-4 text-pink-500 absolute -right-1 -top-1" />
      </motion.button>
    </motion.div>
  );
};

export default ShareLinkButton;
