import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';

export type UserRole = 'admin' | 'editor' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  role: UserRole;
  department: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'],
  editor: ['dashboard:view', 'list:view', 'list:create', 'list:edit', 'list:export', 'form:create', 'profile:view'],
  user: ['dashboard:view', 'list:view', 'profile:view'],
};

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  admin: {
    id: 'usr_admin',
    name: 'Seraphina Vance',
    email: 'seraphina.vance@acme.corp',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'VP of Platform Engineering',
    role: 'admin',
    department: 'Infrastructure',
  },
  editor: {
    id: 'usr_editor',
    name: 'Marcus Chen',
    email: 'marcus.chen@acme.corp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'Lead Product Operations',
    role: 'editor',
    department: 'Product Operations',
  },
  user: {
    id: 'usr_user',
    name: 'Elena Rostova',
    email: 'elena.rostova@acme.corp',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Data Analyst',
    role: 'user',
    department: 'Business Intelligence',
  },
};

export interface AuthState {
  currentUser: UserProfile;
  isAuthenticated: boolean;
}

export const authStore = new Store<AuthState>({
  currentUser: MOCK_USERS.admin,
  isAuthenticated: true,
});

export function setRole(role: UserRole) {
  authStore.setState((prev) => ({
    ...prev,
    currentUser: MOCK_USERS[role],
  }));
}

export function logout() {
  authStore.setState((prev) => ({
    ...prev,
    isAuthenticated: false,
  }));
}

export function login(role: UserRole = 'admin') {
  authStore.setState({
    currentUser: MOCK_USERS[role],
    isAuthenticated: true,
  });
}

export function useAuth() {
  return useStore(authStore);
}

export function useCurrentUser() {
  return useStore(authStore, (s) => s.currentUser);
}
