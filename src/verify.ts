import crypto, { KeyObject } from 'crypto';
import axios from 'axios';
import config from '../config.json';

let kickPublicKey: KeyObject | null = null;

const refreshKickPublicKey = async () => {
  const response = await axios.get('https://api.kick.com/public/v1/public-key');

  const key = response.data?.data?.public_key;

  kickPublicKey = crypto.createPublicKey({ key, format: 'pem', type: 'spki' });

  return kickPublicKey;
};

const verify = (...args: [string, string, KeyObject]) => {
  const [signatureMessage, signature, publicKey] = args;

  return crypto.verify(
    'sha256',
    Buffer.from(signatureMessage),
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(signature, 'base64')
  );
};

export const verifyTwitch = (...args: string[]) => {
  const [messageId, timestamp, signature, body] = args;

  const message = messageId + timestamp + body;

  const hmac = crypto.createHmac('sha256', config.twitch_secret);
  const hmacSignature = 'sha256=' + hmac.update(message).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmacSignature));
};

export const verifyKick = async (...args: string[]) => {
  const [signatureMessage, signature] = args;

  if (!kickPublicKey) {
    await refreshKickPublicKey();
  }

  if (!kickPublicKey) throw new Error();

  let valid = verify(signatureMessage, signature, kickPublicKey);

  if (!valid) {
    console.log('🔑 public key refresh');

    const newKey = await refreshKickPublicKey();

    if (newKey) {
      valid = verify(signatureMessage, signature, newKey);
    }
  }

  return valid;
};
