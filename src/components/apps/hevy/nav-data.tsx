import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  Dumbbell,
  Layers3,
  Settings,
  UserRoundCog,
} from 'lucide-react';

export type HevyTabId = 'home' | 'workouts' | 'plans' | 'progress' | 'settings';

export type HevyNavItem = {
  id: HevyTabId;
  label: string;
  description: string;
  ctaLabel: string;
  secondaryCta?: string;
  icon: LucideIcon;
  accent: string;
};

export const HEVY_NAV_ITEMS: HevyNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    description: 'Today’s readiness, next workout, and quick stats.',
    ctaLabel: 'Start workout',
    secondaryCta: 'Log measurement',
    icon: Activity,
    accent: 'from-sky-400/80 to-sky-300/40',
  },
  {
    id: 'workouts',
    label: 'Workouts',
    description: 'Build or log custom workouts with supersets.',
    ctaLabel: 'Create workout',
    secondaryCta: 'Add exercise',
    icon: Dumbbell,
    accent: 'from-cyan-400/80 to-blue-400/40',
  },
  {
    id: 'plans',
    label: 'Plans',
    description: 'Manage multi-week routines and split templates.',
    ctaLabel: 'New routine',
    secondaryCta: 'Browse plans',
    icon: Layers3,
    accent: 'from-violet-400/80 to-fuchsia-400/40',
  },
  {
    id: 'progress',
    label: 'Progress',
    description: 'Track PRs, volume, and body stats over time.',
    ctaLabel: 'View analytics',
    secondaryCta: 'Add body stat',
    icon: BarChart3,
    accent: 'from-emerald-400/80 to-lime-400/40',
  },
  {
    id: 'settings',
    label: 'More',
    description: 'Adjust preferences, data export, and devices.',
    ctaLabel: 'Open settings',
    secondaryCta: 'Profile',
    icon: Settings,
    accent: 'from-slate-200/80 to-slate-100/30',
  },
];

export const HEVY_USER_ICON: LucideIcon = UserRoundCog;
