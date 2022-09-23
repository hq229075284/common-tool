import { decodeAES, encodeAES } from '../src/crypto/AES'

test('AES加密解密', () => {
  const text = '123'
  const secureKey = 'jEJubVMxoBnfv1Ut4owGZ3TT'
  expect(decodeAES(encodeAES(text, secureKey), secureKey)).toBe(text)
})
