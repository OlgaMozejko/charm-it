export interface BaseCharmProps {

  size?: number;
  
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

  offset?: { x: number; y: number };

  className?: string;
}