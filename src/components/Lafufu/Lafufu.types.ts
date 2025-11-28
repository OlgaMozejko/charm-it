interface LafufuProps {
  size?: keyof typeof LAFUFU_SIZE_CONFIG;

  string?: {length?: number, chainLinks?: number, color?: string};

  color?: string;
}

const LAFUFU_SIZE_CONFIG = {
  small: { width: 55, height: 95, stringLength: 70, chainLinks: 10, overlap: 20 },
  medium: { width: 85, height: 145, stringLength: 110, chainLinks: 16, overlap: 30 },
  large: { width: 120, height: 205, stringLength: 160, chainLinks: 22, overlap: 42 },
};

export { type LafufuProps, LAFUFU_SIZE_CONFIG };