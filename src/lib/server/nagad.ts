import axios from 'axios';
import crypto from 'crypto';

const NagadBaseURL = process.env.NAGAD_BASE_URL || 'https://sandbox.mynagad.com/api';

function generateSignature(data: string): string {
  const privateKey = process.env.NAGAD_PRIVATE_KEY || '';
  return crypto.createSign('SHA256').update(data).sign(privateKey, 'base64');
}

export async function createNagadPayment(amount: number, orderId: string, customerPhone: string) {
  const merchantId = process.env.NAGAD_MERCHANT_ID;
  const timestamp = new Date().toISOString();
  const suffix = Date.now();

  const requestData = {
    merchantId,
    orderId: `${orderId}-${suffix}`,
    currencyCode: '050',
    amount: amount.toString(),
    callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payment/nagad/callback`,
    additionalInfo: JSON.stringify({ orderId }),
    clientMobileNo: customerPhone,
    merchantCallbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payment/nagad/callback`,
  };

  const dataString = JSON.stringify(requestData);
  const signature = generateSignature(dataString);

  const res = await axios.post(`${NagadBaseURL}/dfs/checkout/initialize/${merchantId}/${orderId}`, requestData, {
    headers: {
      'X-Merchant-Id': merchantId,
      'X-Datetime': timestamp,
      'X-Signature': signature,
      'Content-Type': 'application/json',
    },
  });

  return res.data;
}

export async function verifyNagadPayment(paymentRefId: string) {
  const merchantId = process.env.NAGAD_MERCHANT_ID;
  const res = await axios.get(`${NagadBaseURL}/dfs/verify/payment/${paymentRefId}`, {
    headers: { 'X-Merchant-Id': merchantId },
  });
  return res.data;
}
