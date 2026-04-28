"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AnimatedPresenceProps {
  children: React.ReactNode;
  show: boolean;
}

export default function AnimatedPresenceWrapper({ children, show }: AnimatedPresenceProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}