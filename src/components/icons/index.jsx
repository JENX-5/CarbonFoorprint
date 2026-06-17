/**
 * icons/index.jsx
 * ---------------------------------------------------------------------------
 * One place that maps domain concepts (nav destinations, footprint
 * categories, gamification concepts) to a consistent icon component. The
 * original app used raw emoji glyphs (🚗 ⚡ 🍽️ 🗑️ 💧 📊 🧮 💡 🔮 🏆 📚) which
 * render inconsistently across operating systems and look out of place in
 * a "professional SaaS" visual language. lucide-react gives crisp,
 * consistent, accessible icons instead — every usage site marks the icon
 * `aria-hidden` and keeps a real text label alongside it.
 * ---------------------------------------------------------------------------
 */
import {
  LayoutDashboard,
  Calculator,
  Sparkles,
  SlidersHorizontal,
  Trophy,
  BookOpen,
  Car,
  Zap,
  Utensils,
  Trash2,
  Droplet,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Flame,
  Award,
  Download,
  RotateCcw,
  TreePine,
  Gauge,
  TrendingDown,
  TrendingUp,
  Info,
  AlertTriangle,
  ArrowRight,
  CircleCheck,
  Lock,
  Route,
  Leaf,
  Mountain,
  PartyPopper,
  Settings,
  Upload
} from 'lucide-react';

export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  calculator: Calculator,
  insights: Sparkles,
  simulator: SlidersHorizontal,
  progress: Trophy,
  learn: BookOpen
};

export const CATEGORY_ICONS = {
  transportation: Car,
  electricity: Zap,
  diet: Utensils,
  waste: Trash2,
  water: Droplet
};

export {
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Flame,
  Award,
  Download,
  RotateCcw,
  TreePine,
  Gauge,
  TrendingDown,
  TrendingUp,
  Info,
  AlertTriangle,
  ArrowRight,
  CircleCheck,
  Lock,
  Route,
  Leaf,
  Mountain,
  Sparkles,
  Trophy,
  PartyPopper,
  Settings,
  Calculator,
  SlidersHorizontal,
  BookOpen,
  LayoutDashboard,
  Car,
  Zap,
  Utensils,
  Trash2,
  Droplet,
  Upload
};
