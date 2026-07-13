import React from 'react';

export function formatPrice(
  eurPrice: number | undefined | null,
  mainClassName = 'text-ds-text font-semibold',
  secondaryClassName = 'text-[11px] text-ds-text-secondary/70'
) {
  if (eurPrice === undefined || eurPrice === null) return null;
  const p = Number(eurPrice) || 0;
  const bgn = p * 1.95583;
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className={mainClassName}>{p.toFixed(2)} €</span>
      <span className={secondaryClassName}>({bgn.toFixed(2)} лв.)</span>
    </span>
  );
}

export function formatPriceRaw(eurPrice: number | undefined | null) {
  if (eurPrice === undefined || eurPrice === null) return '';
  const p = Number(eurPrice) || 0;
  const bgn = p * 1.95583;
  return `${p.toFixed(2)} € (${bgn.toFixed(2)} лв.)`;
}
