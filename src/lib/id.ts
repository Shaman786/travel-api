import { customAlphabet } from "nanoid";

// Create a generator: URL-safe, 12 characters long
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const generate = customAlphabet(alphabet, 12);

export const generateId = (prefix: "usr" | "pkg" | "txn" | "img") => {
  return `${prefix}_${generate()}`;
};

export const generateBookingRef = () => {
  // Logic: BK-YYYY-RANDOM
  const date = new Date().getFullYear();
  const random = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6)();
  return `BK-${date}-${random}`;
};
