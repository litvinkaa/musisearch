import * as CryptoJS from 'crypto-js';

export const encrypt = async (raw) => {
    let key = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_CRYPTOGRAPHY_KEY);
    let encrypted = CryptoJS.AES.encrypt(raw, key, {mode: CryptoJS.mode.ECB});
    encrypted = encrypted.toString();
    return encrypted;
}

export const decrypt = async (enc) => {
    let key = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_CRYPTOGRAPHY_KEY); 
    let decrypted =  CryptoJS.AES.decrypt(enc, key, {mode:CryptoJS.mode.ECB}).toString(CryptoJS.enc.Utf8);
    return decrypted;
}