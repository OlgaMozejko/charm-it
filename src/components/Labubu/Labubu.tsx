import React, { useRef } from 'react';
import { 
  motion, 
  useMotionValue, 
  useScroll, 
  useVelocity, 
  useAnimationFrame, 
  useTransform,
  type PanInfo 
} from 'motion/react';
import styles from './Labubu.module.css';

interface LabubuProps {
  width?: number;
  height?: number;
  color?: string;
  chainColor?: string;
  stringLength?: number;
  anchorPosition?: { x: number; y: number };
}

export const Labubu: React.FC<LabubuProps> = ({ 
  width = 50,
  height = 80,
  color = '#FF6B9D',
  chainColor = '#333',
  stringLength = 220,
  anchorPosition = { x: 200, y: 50 }
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chainRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isDragging = useRef(false);
  
  const x = useMotionValue(anchorPosition.x);
  const y = useMotionValue(anchorPosition.y + stringLength + height / 2);
  const vx = useMotionValue(0);
  const vy = useMotionValue(0);
  const rotate = useMotionValue(0);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const scrollForce = useTransform(scrollVelocity, (v) => {
    const sensitivity = 0.015;
    const maxForce = 2;
    return Math.max(Math.min(v * sensitivity, maxForce), -maxForce);
  });

  // -- DRAG STATE --
  const localDragOffset = useRef({ x: 0, y: 0 });
  const rotationCorrection = useRef(0); // To prevent snapping on start
  const isGrabbingHook = useRef(false); // New flag

  const CHAIN_LINKS = 16;
  const GRAVITY = 0.6;
  const FRICTION = 0.99;
  const ELASTICITY = 0.1;

  const getTopPosition = (cx: number, cy: number, rotationDeg: number) => {
    const rad = rotationDeg * (Math.PI / 180);
    const dx = Math.sin(rad) * (height / 2);
    const dy = -Math.cos(rad) * (height / 2);
    return { x: cx + dx, y: cy + dy };
  };

  useAnimationFrame(() => {
    if (!chainRefs.current) return;

    let cx = x.get();
    let cy = y.get();
    let cvx = vx.get();
    let cvy = vy.get();
    let cRotate = rotate.get();

    if (!isDragging.current) {
      // Free Fall Physics
      cvy += GRAVITY;
      cvx += scrollForce.get();
      cvx *= FRICTION;
      cvy *= FRICTION;

      let nextX = cx + cvx;
      let nextY = cy + cvy;

      const topPos = getTopPosition(nextX, nextY, cRotate);
      const dx = topPos.x - anchorPosition.x;
      const dy = topPos.y - anchorPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > stringLength) {
        const angle = Math.atan2(dy, dx);
        const stretch = distance - stringLength;
        const pullBack = stretch * ELASTICITY; 
        
        const constrainedTopX = anchorPosition.x + Math.cos(angle) * (stringLength + pullBack);
        const constrainedTopY = anchorPosition.y + Math.sin(angle) * (stringLength + pullBack);

        nextX += constrainedTopX - topPos.x;
        nextY += constrainedTopY - topPos.y;

        const nx = dx / distance;
        const ny = dy / distance;
        const vDotN = cvx * nx + cvy * ny;
        if (vDotN > 0) {
          cvx -= vDotN * nx;
          cvy -= vDotN * ny;
        }
      }

      // Auto Rotation (Gravity/Dangle)
      const dxStr = nextX - anchorPosition.x;
      const dyStr = nextY - anchorPosition.y;
      const stringAngle = Math.atan2(dyStr, dxStr) * (180 / Math.PI);
      const targetRot = stringAngle - 90; 
      const rotDiff = ((targetRot - cRotate + 540) % 360) - 180;
      cRotate += rotDiff * 0.1;

      vx.set(cvx);
      vy.set(cvy);
      x.set(nextX);
      y.set(nextY);
      rotate.set(cRotate);
      
      cx = nextX;
      cy = nextY;
    }

    const finalTop = getTopPosition(cx, cy, cRotate);
    updateChainVisuals(finalTop.x, finalTop.y);
  });

  const updateChainVisuals = (targetX: number, targetY: number) => {
    const dx = targetX - anchorPosition.x;
    const dy = targetY - anchorPosition.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const slack = Math.max(0, stringLength - dist);
    const sagAmount = slack * 0.5;

    for (let i = 0; i < CHAIN_LINKS; i++) {
      const node = chainRefs.current[i];
      if (!node) continue;
      const t = (i + 1) / (CHAIN_LINKS + 1);
      const lx = anchorPosition.x + dx * t;
      const ly = anchorPosition.y + dy * t;
      const curveY = sagAmount * 4 * t * (1 - t);
      node.style.transform = `translate(${lx}px, ${ly + curveY}px)`;
    }
  };

  const handleDragStart = (e: any, info: PanInfo) => {
    isDragging.current = true;
    vx.set(0);
    vy.set(0);

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const mouseX = info.point.x - containerRect.left;
    const mouseY = info.point.y - containerRect.top;
    
    // 1. Calculate Local Offset (Where did we click relative to center?)
    const currentCenterX = x.get();
    const currentCenterY = y.get();
    const visualDx = mouseX - currentCenterX;
    const visualDy = mouseY - currentCenterY;
    
    const currentRotRad = rotate.get() * (Math.PI / 180);
    const cos = Math.cos(-currentRotRad);
    const sin = Math.sin(-currentRotRad);
    
    localDragOffset.current = {
      x: visualDx * cos - visualDy * sin,
      y: visualDx * sin + visualDy * cos
    };

    // 2. CHECK IF GRABBING TOP (HOOK)
    // The hook is at (0, -height/2)
    const hookX = 0;
    const hookY = -height / 2;
    const distToHook = Math.sqrt(
      Math.pow(localDragOffset.current.x - hookX, 2) + 
      Math.pow(localDragOffset.current.y - hookY, 2)
    );

    // If we are within 20px of the top hook, we consider this a "Hook Drag"
    if (distToHook < 20) {
      isGrabbingHook.current = true;
    } else {
      isGrabbingHook.current = false;
      
      // 3. PREVENT SNAP: Calculate the rotation math NOW and save the difference
      // This ensures that on the first frame of drag, the rotation doesn't jump.
      const bodyVecX = hookX - localDragOffset.current.x;
      const bodyVecY = hookY - localDragOffset.current.y;
      const bodyAngle = Math.atan2(bodyVecY, bodyVecX);

      const worldVecX = anchorPosition.x - mouseX;
      const worldVecY = anchorPosition.y - mouseY;
      const worldAngle = Math.atan2(worldVecY, worldVecX);

      const calculatedRot = (worldAngle - bodyAngle) * (180 / Math.PI);
      
      // Save the offset between Current Reality and Math Reality
      rotationCorrection.current = rotate.get() - calculatedRot;
    }
  };

  const handleDrag = (e: any, info: PanInfo) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const mouseX = info.point.x - containerRect.left;
    const mouseY = info.point.y - containerRect.top;
    
    let newRotation = rotate.get();

    // Only calculate rotation if we are NOT grabbing the hook directly
    if (!isGrabbingHook.current) {
      // 1. Vector from DragPoint to Hook (Top Center)
      const bodyVecX = 0 - localDragOffset.current.x;
      const bodyVecY = (-height / 2) - localDragOffset.current.y;
      const bodyAngle = Math.atan2(bodyVecY, bodyVecX);

      // 2. Vector from Mouse to Anchor
      const worldVecX = anchorPosition.x - mouseX;
      const worldVecY = anchorPosition.y - mouseY;
      const worldAngle = Math.atan2(worldVecY, worldVecX);

      // 3. Apply rotation + The Correction Offset we saved at start
      newRotation = ((worldAngle - bodyAngle) * (180 / Math.PI)) + rotationCorrection.current;
      
      // Decay the correction over time? 
      // Ideally yes, but keeping it constant prevents jitteriness while dragging.
    } else {
       // If grabbing hook, let it slowly align with gravity or just stay put?
       // For now, we just keep the previous rotation (feel free to add auto-align logic here)
    }

    rotate.set(newRotation);

    // --- POSITION CALCULATION ---
    const rotRad = newRotation * (Math.PI / 180);
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);

    // Rotate the local offset to world space
    const rotatedOffsetX = localDragOffset.current.x * cos - localDragOffset.current.y * sin;
    const rotatedOffsetY = localDragOffset.current.x * sin + localDragOffset.current.y * cos;

    // Center = Mouse - RotatedOffset
    let finalX = mouseX - rotatedOffsetX;
    let finalY = mouseY - rotatedOffsetY;

    // --- STRING CONSTRAINT ---
    const currentTop = getTopPosition(finalX, finalY, newRotation);
    const dx = currentTop.x - anchorPosition.x;
    const dy = currentTop.y - anchorPosition.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > stringLength) {
      const ratio = stringLength / dist;
      const constrainedTopX = anchorPosition.x + dx * ratio;
      const constrainedTopY = anchorPosition.y + dy * ratio;
      
      finalX += constrainedTopX - currentTop.x;
      finalY += constrainedTopY - currentTop.y;
    }

    x.set(finalX);
    y.set(finalY);
    
    const finalTop = getTopPosition(finalX, finalY, newRotation);
    updateChainVisuals(finalTop.x, finalTop.y);
  };

  const handleDragEnd = (e: any, info: PanInfo) => {
    isDragging.current = false;
    vx.set(info.velocity.x / 60);
    vy.set(info.velocity.y / 60);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.anchor} style={{ left: anchorPosition.x, top: anchorPosition.y }} />
      {Array.from({ length: CHAIN_LINKS }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { chainRefs.current[i] = el; }}
          className={styles.chainLink}
          style={{ backgroundColor: chainColor }}
        />
      ))}
      <motion.div
        className={styles.rectangleWrapper}
        style={{
          x, y, width, height, rotate,
          marginLeft: -width / 2,
          marginTop: -height / 2,
        }}
        drag
        dragElastic={0}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, cursor: "grabbing" }}
      >
        <div className={styles.hook} />
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={styles.rectangleSVG}>
          <rect x="0" y="0" width={width} height={height} fill={color} rx="8" ry="8" />
        </svg>
      </motion.div>
    </div>
  );
};