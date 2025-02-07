import React from "react";
import { motion } from "framer-motion";

const EnjoymentComponent = () => {
  const handlePlayAgain = () => {
    localStorage.removeItem("gameSession");
    window.location.href = "/";
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.h1
          className="text-4xl font-bold mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Enjoying it? 🎮
        </motion.h1>
        <div onClick={handlePlayAgain} className="p-16">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold 
                     shadow-lg hover:bg-indigo-700 transition-colors"
          >
            Play Again
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default EnjoymentComponent;
