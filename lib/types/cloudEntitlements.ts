import { ENTITLEMENT_TIERS as _ENTITLEMENT_TIERS, type EntitlementTier as _EntitlementTier } from '@/lib/entitlements/tiers';

export const CLOUD_IDS = [
  'creation',
  'video',
  'writing',
  'file',
  'monetization',
  'intelligence',
  'music',
  'growth',
  'shopping',
  'advertising',
  'gaming',
  'ecommerce',
] as const;

export type CloudId = (typeof CLOUD_IDS)[number];

export const DEPRECATED_CLOUD_IDS = new Set<CloudId>(['file', 'monetization']);

export const PUBLIC_CLOUD_IDS: CloudId[] = CLOUD_IDS.filter(
  (id) => !DEPRECATED_CLOUD_IDS.has(id)
);

export const ENTITLEMENT_TIERS = _ENTITLEMENT_TIERS;
export type EntitlementTier = _EntitlementTier;

export type CloudEntitlementsMap = Partial<Record<CloudId, EntitlementTier>>;

export const ENTITLEMENT_SOURCES = ['stripe', 'manual_grant', 'bundle', 'promotion'] as const;
export type EntitlementSource = (typeof ENTITLEMENT_SOURCES)[number];

export const ENTITLEMENT_STATUSES = ['active', 'past_due', 'canceled', 'trial'] as const;
export type EntitlementStatus = (typeof ENTITLEMENT_STATUSES)[number];

export interface CloudEntitlement {
  id: string;
  user_id: number;
  cloud_id: CloudId;
  tier: EntitlementTier;
  source: EntitlementSource;
  status: EntitlementStatus;
  valid_from: string;
  valid_to: string | null;
  created_at: string;
  updated_at: string;
}
