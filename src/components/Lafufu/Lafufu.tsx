import { useRef, type FC } from 'react';
import { 
  motion, 
  useMotionValue, 
  useScroll, 
  useVelocity, 
  useAnimationFrame, 
  useTransform,
  type PanInfo 
} from 'motion/react';
import styles from './Lafufu.module.css';
import { LafufuFigure } from './LafufuFigure';
import { type LafufuProps, LAFUFU_SIZE_CONFIG } from './Lafufu.types';

const ANCHOR_SIZE = 16;

export const Lafufu: FC<LafufuProps> = ({ 
  size = 'medium',
  string: { length: customStringLength, chainLinks: customChainLinks, color: customStringColor } = {},
  color = '#E8E5DC',
}) => {
  const config = LAFUFU_SIZE_CONFIG[size];
  const width = config.width;
  const height = config.height;
  const stringLength = customStringLength ?? config.stringLength;
  const chainLinks = customChainLinks ?? config.chainLinks;
  const chainColor = customStringColor ?? '#333';

  const CHAIN_VISUAL_OVERLAP = config.overlap;

  // Anchor point is at the center of the anchor element
  const anchorPosition = { x: ANCHOR_SIZE / 2, y: ANCHOR_SIZE / 2 };
  
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
    const sensitivity = 0.0001;
    const maxForce = 2;
    return Math.max(Math.min(v * sensitivity, maxForce), -maxForce);
  });

  const dragStartOffset = useRef({ x: 0, y: 0 });
  const initialSlack = useRef(0);

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
    const currentRotation = rotate.get();
    const rad = currentRotation * (Math.PI / 180);
    
    const visualEndX = targetX - Math.sin(rad) * CHAIN_VISUAL_OVERLAP;
    const visualEndY = targetY + Math.cos(rad) * CHAIN_VISUAL_OVERLAP;
    
    const dx = visualEndX - anchorPosition.x;
    const dy = visualEndY - anchorPosition.y;
    
    const physicsDx = targetX - anchorPosition.x;
    const physicsDy = targetY - anchorPosition.y;
    const physicsDist = Math.sqrt(physicsDx * physicsDx + physicsDy * physicsDy);
    const slack = Math.max(0, stringLength - physicsDist);
    const sagAmount = slack * 0.4;

    for (let i = 0; i < chainLinks; i++) {
      const node = chainRefs.current[i];
      if (!node) continue;
      const t = i / (chainLinks - 1);
      const lx = anchorPosition.x + dx * t;
      const ly = anchorPosition.y + dy * t;
      const curveY = sagAmount * 4 * t * (1 - t);
      
      node.style.transform = `translate(${lx}px, ${ly + curveY}px) translate(-50%, -50%)`;
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
    
    const currentCenterX = x.get();
    const currentCenterY = y.get();
    
    dragStartOffset.current = {
      x: currentCenterX - mouseX,
      y: currentCenterY - mouseY
    };

    const currentRotation = rotate.get();
    const topPos = getTopPosition(currentCenterX, currentCenterY, currentRotation);
    const dx = topPos.x - anchorPosition.x;
    const dy = topPos.y - anchorPosition.y;
    const currentDist = Math.sqrt(dx * dx + dy * dy);
    
    initialSlack.current = Math.max(0, stringLength - currentDist);
  };

  const handleDrag = (e: any, info: PanInfo) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const mouseX = info.point.x - containerRect.left;
    const mouseY = info.point.y - containerRect.top;
    
    let targetX = mouseX + dragStartOffset.current.x;
    let targetY = mouseY + dragStartOffset.current.y;
    
    const dxFromAnchor = targetX - anchorPosition.x;
    const dyFromAnchor = targetY - anchorPosition.y;
    const stringAngle = Math.atan2(dyFromAnchor, dxFromAnchor) * (180 / Math.PI);
    const newRotation = stringAngle - 90;
    
    rotate.set(newRotation);

    const topPos = getTopPosition(targetX, targetY, newRotation);
    const dx = topPos.x - anchorPosition.x;
    const dy = topPos.y - anchorPosition.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const effectiveMaxLength = stringLength + initialSlack.current * 0.5;

    if (dist > effectiveMaxLength) {
      const ratio = effectiveMaxLength / dist;
      const constrainedTopX = anchorPosition.x + dx * ratio;
      const constrainedTopY = anchorPosition.y + dy * ratio;
      
      targetX += constrainedTopX - topPos.x;
      targetY += constrainedTopY - topPos.y;
      
      initialSlack.current *= 0.95;
    }

    x.set(targetX);
    y.set(targetY);
    
    const finalTop = getTopPosition(targetX, targetY, newRotation);
    updateChainVisuals(finalTop.x, finalTop.y);
  };

  const handleDragEnd = (e: any, info: PanInfo) => {
    isDragging.current = false;
    vx.set(info.velocity.x / 60);
    vy.set(info.velocity.y / 60);
    initialSlack.current = 0;
  };

  return (
    <div className={styles.container} ref={containerRef} role='presentation'>
      <div className={styles.anchor} style={{ backgroundColor: chainColor }}/>
      
      {Array.from({ length: chainLinks }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { chainRefs.current[i] = el; }}
          className={styles.chainLink}
          style={{ backgroundColor: chainColor }}
        />
      ))}
      
      <motion.div
        className={styles.figure}
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
      >
        <LafufuFigure color={color} />
      </motion.div>
    </div>
  );
};