const MILLION = 1_000_000;
const BILLION = 1_000_000_000;
const NAIRA_SYMBOL = '\u20A6';

export const normalizeMoneyAmount = (value) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  // Admin shorthand: decimal values below 1000 represent millions (e.g. 3.6 => 3.6M).
  if (amount > 0 && amount < 1000 && !Number.isInteger(amount)) {
    return Math.round(amount * MILLION);
  }

  return Math.round(amount);
};

export const formatNaira = (value) =>
  `${NAIRA_SYMBOL}${normalizeMoneyAmount(value).toLocaleString('en-NG')}`;

export const formatNairaYear = (value, { compact = true } = {}) => {
  const amount = normalizeMoneyAmount(value);
  if (!compact) return `${formatNaira(amount)}/year`;
  if (amount >= BILLION) return `${NAIRA_SYMBOL}${(amount / BILLION).toFixed(1)}B/year`;
  if (amount >= MILLION) return `${NAIRA_SYMBOL}${(amount / MILLION).toFixed(1)}M/year`;
  return `${formatNaira(amount)}/year`;
};

export const formatPriceWordsYearly = (value) => {
  const amount = normalizeMoneyAmount(value);
  if (amount >= BILLION) {
    const billions = amount / BILLION;
    const formatted = Number.isInteger(billions) ? String(billions) : billions.toFixed(1);
    return `${formatted} billion naira yearly`;
  }
  if (amount >= MILLION) {
    const millions = amount / MILLION;
    const formatted = Number.isInteger(millions) ? String(millions) : millions.toFixed(1);
    return `${formatted} million naira yearly`;
  }
  if (amount >= 1_000) {
    const thousands = Math.floor(amount / 1_000);
    const remainder = amount % 1_000;
    if (remainder === 0) return `${thousands.toLocaleString('en-NG')} thousand naira yearly`;
    return `${thousands.toLocaleString('en-NG')} thousand ${remainder.toLocaleString('en-NG')} naira yearly`;
  }
  return `${amount.toLocaleString('en-NG')} naira yearly`;
};
