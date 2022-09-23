import AES from 'crypto-js/aes'
import ECB from 'crypto-js/mode-ecb'
import Pkcs7 from 'crypto-js/pad-pkcs7'
import CryptoJSCore from 'crypto-js/core'

export function encodeAES(text, secureKey: string) {
  return AES.encrypt(text, CryptoJSCore.enc.Utf8.parse(secureKey), { mode: ECB, padding: Pkcs7 })
}

export function decodeAES(cipherText: string, secureKey: string) {
  return AES.decrypt(cipherText, CryptoJSCore.enc.Utf8.parse(secureKey), { mode: ECB, padding: Pkcs7 }).toString(CryptoJSCore.enc.Utf8)
  //   const wa = AES.decrypt(cipherText, CryptoJSCore.enc.Utf8.parse(secureKey), { mode: ECB, padding: Pkcs7 })
  //   const text = wa.toString(CryptoJSCore.enc.Utf8)
  //   return text
}
