import axios from 'axios';

const BkashBaseURL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

let token: string | null = null;
let tokenExpiry: number | null = null;

async function getToken(): Promise<string> {
  if (token && tokenExpiry && Date.now() < tokenExpiry) return token;
  const res = await axios.post(`${BkashBaseURL}/tokenized/checkout/token/grant`, {
    app_key: process.env.BKASH_APP_KEY,
    app_secret: process.env.BKASH_APP_SECRET,
  });
  token = res.data?.id_token;
  tokenExpiry = Date.now() + (res.data?.expires_in || 3600) * 1000;
  return token!;
}

export async function createBkashPayment(amount: number, orderId: string, customerPhone: string) {
  const token = await getToken();
  const res = await axios.post(`${BkashBaseURL}/tokenized/checkout/create`, {
    mode: '0011',
    payerReference: orderId,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payment/bkash/callback`,
    amount: amount.toString(),
    currency: 'BDT',
    intent: 'sale',
    merchantInvoiceNumber: orderId,
  }, { headers: { Authorization: token, 'X-APP-Key': process.env.BKASH_APP_KEY } });
  return res.data;
}

export async function executeBkashPayment(paymentId: string) {
  const token = await getToken();
  const res = await axios.post(`${BkashBaseURL}/tokenized/checkout/execute`, {
    paymentID: paymentId,
  }, { headers: { Authorization: token, 'X-APP-Key': process.env.BKASH_APP_KEY } });
  return res.data;
}

export async function queryBkashPayment(paymentId: string) {
  const token = await getToken();
  const res = await axios.post(`${BkashBaseURL}/tokenized/checkout/payment/status`, {
    paymentID: paymentId,
  }, { headers: { Authorization: token, 'X-APP-Key': process.env.BKASH_APP_KEY } });
  return res.data;
}
