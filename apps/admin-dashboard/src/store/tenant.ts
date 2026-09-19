import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';

export interface Tenant {
  id: string;
  name: string;
  tier: 'Enterprise' | 'Scale' | 'Staging' | 'Internal';
  env: 'Production' | 'Staging' | 'Development';
  region: string;
}

export const AVAILABLE_TENANTS: Tenant[] = [
  {
    id: 'org_acme_prod',
    name: 'Acme Corp [US-East]',
    tier: 'Enterprise',
    env: 'Production',
    region: 'us-east-1',
  },
  {
    id: 'org_acme_eu',
    name: 'Acme Corp [EU-West]',
    tier: 'Enterprise',
    env: 'Production',
    region: 'eu-west-1',
  },
  {
    id: 'org_acme_stg',
    name: 'Acme Staging [Sandbox]',
    tier: 'Staging',
    env: 'Staging',
    region: 'us-east-1',
  },
  {
    id: 'org_dev_labs',
    name: 'Dev Labs [Experimental]',
    tier: 'Internal',
    env: 'Development',
    region: 'local-cluster',
  },
];

export interface TenantState {
  currentTenant: Tenant;
  tenants: Tenant[];
}

export const tenantStore = new Store<TenantState>({
  currentTenant: AVAILABLE_TENANTS[0],
  tenants: AVAILABLE_TENANTS,
});

export function switchTenant(tenantId: string) {
  const found = AVAILABLE_TENANTS.find((t) => t.id === tenantId);
  if (found) {
    tenantStore.setState((prev) => ({
      ...prev,
      currentTenant: found,
    }));
  }
}

export function useCurrentTenant() {
  return useStore(tenantStore, (s) => s.currentTenant);
}

export function useTenants() {
  return useStore(tenantStore, (s) => s.tenants);
}
