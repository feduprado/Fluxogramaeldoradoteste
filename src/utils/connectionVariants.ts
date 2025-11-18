import { ConnectionVariant } from '../types';

const VARIANT_LABELS: Record<Exclude<ConnectionVariant, 'neutral'>, string> = {
  positive: 'Sim',
  negative: 'Não',
};

const normalizeLabel = (label?: string): string =>
  (label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const labelForVariant = (variant: ConnectionVariant): string | undefined =>
  variant === 'neutral' ? undefined : VARIANT_LABELS[variant];

export const inferVariantFromLabel = (label?: string): ConnectionVariant => {
  const normalized = normalizeLabel(label);
  if (!normalized) {
    return 'neutral';
  }
  if (normalized === 'sim' || normalized === 'yes') {
    return 'positive';
  }
  if (normalized === 'nao' || normalized === 'no') {
    return 'negative';
  }
  return 'neutral';
};
