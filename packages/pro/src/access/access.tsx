import { createContext, useContext, type ReactNode } from 'react';

export interface AccessProps {
  /** Condition determining whether children should be rendered */
  accessible: boolean;
  /** Optional fallback to render when accessible is false (defaults to null) */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * UmiJS plugin-access parity component.
 * Conditionally renders children if accessible is true, otherwise renders fallback.
 */
export function Access({ accessible, fallback = null, children }: AccessProps) {
  if (!accessible) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}

export interface AccessContextValue<T = Record<string, boolean>> {
  access: T;
  role?: string;
  can: (permission: string) => boolean;
}

const AccessContext = createContext<AccessContextValue<any> | null>(null);

export interface AccessProviderProps<T = Record<string, boolean>> {
  access: T;
  role?: string;
  can?: (permission: string) => boolean;
  children: ReactNode;
}

/**
 * Global RBAC Access Provider supplying permissions and roles to child components.
 */
export function AccessProvider<T = Record<string, boolean>>({
  access,
  role,
  can,
  children,
}: AccessProviderProps<T>) {
  const defaultCan = (permission: string) => {
    if (access && typeof access === 'object') {
      const record = access as Record<string, unknown>;
      if (record['*'] === true) return true;
      return Boolean(record[permission]);
    }
    return false;
  };

  return (
    <AccessContext.Provider
      value={{
        access,
        role,
        can: can || defaultCan,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
}

/**
 * Hook to consume current RBAC access context.
 */
export function useAccessContext<T = Record<string, boolean>>(): AccessContextValue<T> {
  const context = useContext(AccessContext);
  if (!context) {
    // Fail closed. An RBAC hook that answers "allowed" outside its provider would silently
    // authorize any component rendered before, or outside, the AccessProvider tree.
    return {
      access: {} as T,
      can: () => false,
    };
  }
  return context as AccessContextValue<T>;
}
