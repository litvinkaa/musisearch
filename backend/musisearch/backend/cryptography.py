import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad,unpad
import os
from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())
CRYPTOGRAPHY_KEY = os.environ.get('CRYPTOGRAPHY_KEY')

def encrypt(raw):
        raw = pad(raw.encode(),16)
        cipher = AES.new(CRYPTOGRAPHY_KEY.encode('utf-8'), AES.MODE_ECB)
        return base64.b64encode(cipher.encrypt(raw))

def decrypt(enc):
        enc = base64.b64decode(enc)
        cipher = AES.new(CRYPTOGRAPHY_KEY.encode('utf-8'), AES.MODE_ECB)
        return unpad(cipher.decrypt(enc),16).decode("utf-8", "ignore")

