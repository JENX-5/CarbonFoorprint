import { NAV_ICONS } from "../components/icons/index.jsx";

/**
 * Navigation items configuration including path, label, icon and description.
 * @type {Array<{ id: string, path: string, label: string, icon: any, description: string }>}
 */
export const NAV_ITEMS = [
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: NAV_ICONS.dashboard,
    description: "Your footprint at a glance",
  },
  {
    id: "calculator",
    path: "/calculator",
    label: "Calculator",
    icon: NAV_ICONS.calculator,
    description: "Measure your footprint",
  },
  {
    id: "insights",
    path: "/insights",
    label: "AI Insights",
    icon: NAV_ICONS.insights,
    description: "Where your impact comes from",
  },
  {
    id: "simulator",
    path: "/simulator",
    label: "Simulator",
    icon: NAV_ICONS.simulator,
    description: 'Test "what if" scenarios',
  },
  {
    id: "progress",
    path: "/progress",
    label: "Progress",
    icon: NAV_ICONS.progress,
    description: "Eco score, streaks & badges",
  },
  {
    id: "learn",
    path: "/learn",
    label: "Education Hub",
    icon: NAV_ICONS.learn,
    description: "Tips by category",
  },
];

/**
 * Finds the navigation item config that matches the start of the given pathname.
 *
 * @param {string} pathname - The active route path (e.g. '/dashboard/edit' or '/dashboard').
 * @returns {{ id: string, path: string, label: string, icon: any, description: string }|undefined} Matched nav item or undefined.
 */
export function findNavItemByPath(pathname) {
  if (typeof pathname !== "string") return undefined;
  return NAV_ITEMS.find((item) => pathname.startsWith(item.path));
}
