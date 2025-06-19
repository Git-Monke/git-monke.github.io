import React from "react";
import {
  siReact,
  siTailwindcss,
  siTypescript,
  siShadcnui,
  siOpenai,
} from "simple-icons";

// Icon component that takes path data and renders an SVG
const Icon = ({
  path,
  size = 24,
  color = "currentColor",
  ...props
}: {
  path: string;
  size?: number;
  color?: string;
  [key: string]: any;
}) => {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} {...props}>
      <path d={path} />
    </svg>
  );
};

// Map of tag names to React components
export const IconMap: Record<
  string,
  React.FC<{ size?: number; color?: string }>
> = {
  react: (props) => <Icon path={siReact.path} {...props} />,
  tailwind: (props) => <Icon path={siTailwindcss.path} {...props} />,
  typescript: (props) => <Icon path={siTypescript.path} {...props} />,
  "shadcn/ui": (props) => <Icon path={siShadcnui.path} {...props} />,
  ai: (props) => <Icon path={siOpenai.path} {...props} />,
};
