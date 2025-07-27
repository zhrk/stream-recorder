const crypto = require('crypto');
const config = require('../../config.json');

const {
  twitch: { secret },
} = config;

const verifyTwitch = (messageId, timestamp, signature, body) => {
  const message = messageId + timestamp + body;

  const hmac = crypto.createHmac('sha256', secret);
  const hmacSignature = 'sha256=' + hmac.update(message).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmacSignature));
};

const verifyKick = (signatureMessage, signature) => {
  const key = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq/+l1WnlRrGSolDMA+A8
6rAhMbQGmQ2SapVcGM3zq8ANXjnhDWocMqfWcTd95btDydITa10kDvHzw9WQOqp2
MZI7ZyrfzJuz5nhTPCiJwTwnEtWft7nV14BYRDHvlfqPUaZ+1KR4OCaO/wWIk/rQ
L/TjY0M70gse8rlBkbo2a8rKhu69RQTRsoaf4DVhDPEeSeI5jVrRDGAMGL3cGuyY
6CLKGdjVEM78g3JfYOvDU/RvfqD7L89TZ3iN94jrmWdGz34JNlEI5hqK8dd7C5EF
BEbZ5jgB8s8ReQV8H+MkuffjdAj3ajDDX3DOJMIut1lBrUVD1AaSrGCKHooWoL2e
twIDAQAB
-----END PUBLIC KEY-----
`;

  return crypto.verify(
    'sha256',
    Buffer.from(signatureMessage),
    {
      key: crypto.createPublicKey({ key, format: 'pem', type: 'spki' }),
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(signature, 'base64')
  );
};

module.exports = { verifyTwitch, verifyKick };
