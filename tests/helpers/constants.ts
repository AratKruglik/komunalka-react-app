function createMockJwtToken(userId: string = '1'): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    iat: Math.floor(Date.now() / 1000),
  };
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${base64Header}.${base64Payload}.mock_signature_for_testing`;
}

export const MOCK_JWT_TOKEN = createMockJwtToken('1');
export const MOCK_USER_ID = '1';
export const BASE_DOMAIN = 'localhost';
