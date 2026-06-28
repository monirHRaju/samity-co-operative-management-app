// Auth utilities placeholder
// Will contain: token storage helpers, auth guard HOCs, role checks

export const formatCurrency = (amountInPaisa: number): string => {
  const taka = amountInPaisa / 100;
  return `৳ ${taka.toFixed(2)}`;
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("bn-BD", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};