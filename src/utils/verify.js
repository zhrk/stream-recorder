const crypto = require('crypto');
const axios = require('axios');
const config = require('../../config.json');

const {
  twitch: { secret },
} = config;

let kickPublicKey = null;

const refreshKickPublicKey = async () => {
  const response = await axios.get('https://api.kick.com/public/v1/public-key');

  const key = response.data?.data?.public_key;

  kickPublicKey = crypto.createPublicKey({ key, format: 'pem', type: 'spki' });
};

const verify = (signatureMessage, signature, publicKey) =>
  crypto.verify(
    'sha256',
    Buffer.from(signatureMessage),
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(signature, 'base64')
  );

const verifyTwitch = (messageId, timestamp, signature, body) => {
  const message = messageId + timestamp + body;

  const hmac = crypto.createHmac('sha256', secret);
  const hmacSignature = 'sha256=' + hmac.update(message).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmacSignature));
};

const verifyKick = async (signatureMessage, signature) => {
  if (!kickPublicKey) {
    await refreshKickPublicKey();
  }

  let valid = verify(signatureMessage, signature, kickPublicKey);

  if (!valid) {
    const newKey = await refreshKickPublicKey();

    if (newKey) {
      valid = verify(signatureMessage, signature, newKey);
    }
  }

  return valid;
};

module.exports = { verifyTwitch, verifyKick };
