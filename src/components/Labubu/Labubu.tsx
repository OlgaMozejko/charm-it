import React from 'react';
import { motion } from 'motion/react';
import styles from './Labubu.module.css';
import type { LabubuProps } from './Labubu.types';

export const Labubu: React.FC<LabubuProps> = ({ 
  size = 48,
  color = '#FF6B9D'
}) => {
  return (
    <motion.div
      className={styles.labubu}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};