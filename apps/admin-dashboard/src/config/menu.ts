import {
  LayoutDashboardIcon,
  TableIcon,
  FileTextIcon,
  UserCheckIcon,
  ShieldAlertIcon,
  SettingsIcon,
} from 'lucide-react';
import type { ProMenuItem } from '@package/pro/pro-layout';

export const ADMIN_MENU_ITEMS: ProMenuItem[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboardIcon,
    children: [
      { key: '/dashboard/analysis', title: 'Analysis', path: '/dashboard/analysis' },
      { key: '/dashboard/workplace', title: 'Workplace', path: '/dashboard/workplace', badge: 'Active' },
    ],
  },
  {
    key: 'management',
    title: 'Data Management',
    icon: TableIcon,
    children: [
      { key: '/list/table-list', title: 'Table List', path: '/list/table-list' },
      { key: '/list/editable-table', title: 'Editable Table', path: '/list/editable-table' },
    ],
  },
  {
    key: 'form',
    title: 'Forms & Wizards',
    icon: FileTextIcon,
    children: [
      { key: '/form/step-form', title: 'Step Form Wizard', path: '/form/step-form' },
    ],
  },
  {
    key: 'profile',
    title: 'Profiles & Details',
    icon: UserCheckIcon,
    children: [
      { key: '/profile/advanced', title: 'Advanced Profile', path: '/profile/advanced' },
    ],
  },
  {
    key: 'system',
    title: 'System & Governance',
    icon: ShieldAlertIcon,
    badge: 'Admin',
    adminOnly: true,
    children: [
      { key: '/system/audit-log', title: 'Audit Trail', path: '/system/audit-log' },
    ],
  },
  {
    key: 'account',
    title: 'Account Settings',
    icon: SettingsIcon,
    children: [
      { key: '/account/settings', title: 'Settings', path: '/account/settings' },
    ],
  },
];

export const ROUTE_TITLES: Record<string, string> = {
  '/dashboard/analysis': 'Analysis',
  '/dashboard/workplace': 'Workplace',
  '/list/table-list': 'Table List',
  '/list/editable-table': 'Editable Table',
  '/form/step-form': 'Step Form',
  '/profile/advanced': 'Advanced Profile',
  '/system/audit-log': 'Audit Trail',
  '/account/settings': 'Account Settings',
};
