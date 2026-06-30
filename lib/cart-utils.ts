import type { CartItem } from "@/lib/store/cart-store";

export function getCartItemEventDate(item: Pick<CartItem, "eventEndDate" | "eventDate" | "startDate">) {
  return item.eventEndDate || item.eventDate || item.startDate;
}

export function isPastDate(value?: string | Date | null) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return date.getTime() < Date.now();
}

export function isCartItemExpired(item: CartItem) {
  return isPastDate(getCartItemEventDate(item));
}

export function getActiveCartItems(items: CartItem[]) {
  return items.filter((item) => !isCartItemExpired(item));
}
