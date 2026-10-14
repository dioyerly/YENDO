import React from 'react';
import {
  KeyRound,
  Wrench,
  Zap,
  Paintbrush,
  Snowflake,
  Hammer,
  Shield,
  Boxes,
  Sparkles,
  Trees,
  Camera,
  Sun,
  Home,
  CheckCircle,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-5 h-5' }) => {
  switch (iconName) {
    case 'KeyRound':
      return <KeyRound className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Paintbrush':
      return <Paintbrush className={className} />;
    case 'Snowflake':
      return <Snowflake className={className} />;
    case 'Hammer':
      return <Hammer className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'Boxes':
      return <Boxes className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Trees':
      return <Trees className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'Sun':
      return <Sun className={className} />;
    default:
      return <Home className={className} />;
  }
};
