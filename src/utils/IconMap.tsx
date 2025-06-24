import React from "react";
import {
  siReact,
  siTailwindcss,
  siTypescript,
  siShadcnui,
  siOpenai,
  siFlutter,
  siDart,
  siMaterialdesign,
  siExpress,
  siSqlite,
  siNodedotjs,
} from "simple-icons";
import {
  Smartphone,
  Database,
  Settings,
  Palette,
  Server,
  Zap,
  Wifi,
} from "lucide-react";

// Icon component that takes path data and renders an SVG (for Simple Icons)
const SimpleIcon = ({
  path,
  size = 24,
  color = "currentColor",
}: {
  path: string;
  size?: number;
  color?: string;
}) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d={path} />
  </svg>
);

// Icon component that wraps Lucide icons with consistent sizing
const LucideIcon = ({
  IconComponent,
  size = 24,
  color = "currentColor",
}: {
  IconComponent: React.ComponentType<any>;
  size?: number;
  color?: string;
}) => <IconComponent size={size} color={color} />;

// Type for icon components
type IconComponent = React.FC<{ size?: number; color?: string }>;

// Map of tag names to React components
export const IconMap: Record<string, IconComponent> = {
  // Simple Icons
  react: (props) => <SimpleIcon path={siReact.path} {...props} />,
  tailwind: (props) => <SimpleIcon path={siTailwindcss.path} {...props} />,
  typescript: (props) => <SimpleIcon path={siTypescript.path} {...props} />,
  "shadcn/ui": (props) => <SimpleIcon path={siShadcnui.path} {...props} />,
  ai: (props) => <SimpleIcon path={siOpenai.path} {...props} />,
  flutter: (props) => <SimpleIcon path={siFlutter.path} {...props} />,
  dart: (props) => <SimpleIcon path={siDart.path} {...props} />,
  "material design": (props) => (
    <SimpleIcon path={siMaterialdesign.path} {...props} />
  ),

  // Lucide Icons
  "mobile development": (props) => (
    <LucideIcon IconComponent={Smartphone} {...props} />
  ),
  "state management": (props) => (
    <LucideIcon IconComponent={Settings} {...props} />
  ),
  postgresql: (props) => <LucideIcon IconComponent={Database} {...props} />,
  supabase: (props) => <LucideIcon IconComponent={Database} {...props} />,
  riverpod: (props) => <LucideIcon IconComponent={Settings} {...props} />,

  // New technology icons
  "model context protocol (mcp)": (props) => (
    <LucideIcon IconComponent={Zap} {...props} />
  ),
  "express.js": (props) => <SimpleIcon path={siExpress.path} {...props} />,
  sqlite: (props) => <SimpleIcon path={siSqlite.path} {...props} />,
  websockets: (props) => <LucideIcon IconComponent={Wifi} {...props} />,
  "node.js": (props) => <SimpleIcon path={siNodedotjs.path} {...props} />,
};
