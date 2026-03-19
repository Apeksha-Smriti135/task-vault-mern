import React from 'react';

const Background = () => {
  // Generate 50 bubbles with random properties
    const bubbles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.floor(Math.random() * (100 - 5 + 1) + 5),
    left: Math.floor(Math.random() * 100),
    delay: Math.random() * 5,
    duration: Math.floor(Math.random() * (15 - 3 + 1) + 3),
    moveX: Math.floor(Math.random() * (200 - (-100) + 1) + (-100)),
  })); // <-- Ensure this is )}); or as shown here


  return (
    <div style={styles.canvas}>
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble"
          style={{
            ...styles.bubble,
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}vw`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            '--moveX': `${b.moveX}px`, // Pass random X movement to CSS
          }}
        />
      ))}
    </div>
  );
};

const styles = {
  canvas: {
    height: '100vh',
    width: '100vw',
    background: 'linear-gradient(to bottom, #edfffa 0%, #31c5d6 100%)',
    position: 'fixed', // Fixed so it stays behind content
    top: 0,
    left: 0,
    overflow: 'hidden',
    zIndex: -1, // Push to back
  },
  bubble: {
    display: 'block',
    borderRadius: '100%',
    opacity: 0.8,
    position: 'absolute',
    bottom: '-100px',
    background: 'radial-gradient(ellipse at top right, #b8c6c6 0%, #30b3d3 46%, #20628c 100%)',
    animationName: 'moveBubble',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
};

export default Background;
