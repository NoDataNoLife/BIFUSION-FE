// Presentation-only prices; these are not a published billing policy.
export const ANT_PRICE_KRW = 10;
export const ANT_PACKAGES = [500, 1000, 3000, 5000] as const;
export const antPrice = (amount: number) => amount * ANT_PRICE_KRW;
