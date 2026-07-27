export interface Money {
  amount: number;
  currency: string;
}

export function moneyFromCents(cents: number, currency: string): Money {
  return {
    amount: cents / 100,
    currency,
  };
}
