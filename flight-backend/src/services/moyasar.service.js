export function createMockMoyasarPayment({ amount, currency = 'SAR' }) {
  const paymentId = `pay_${Date.now()}`;
  return {
    provider: 'moyasar',
    paymentId,
    currency,
    amount: Number(amount || 0),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    paidAt: null,
  };
}
