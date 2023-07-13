import os
from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')

FRONTEND_ORIGIN = os.environ.get('FRONTEND_ORIGIN')

S3_URL = os.environ.get('S3_URL')

