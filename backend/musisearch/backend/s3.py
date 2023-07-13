import boto3
from botocore.exceptions import NoCredentialsError
import mimetypes
import os
from dotenv import find_dotenv, load_dotenv
from musisearch.config import S3_URL

load_dotenv(find_dotenv())

S3_ACCESS_KEY_ID = os.environ.get('S3_ACCESS_KEY_ID')
S3_SECRET_ACCESS_KEY = os.environ.get('S3_SECRET_ACCESS_KEY')
S3_NAME = os.environ.get('S3_NAME')


def upload_file(file, file_path):
    s3 = boto3.client('s3', aws_access_key_id=S3_ACCESS_KEY_ID, aws_secret_access_key=S3_SECRET_ACCESS_KEY)
    content_type = file.content_type
    extension = mimetypes.guess_extension(content_type)
    s3.upload_fileobj(file, S3_NAME, file_path + extension)
    return S3_URL + file_path + extension
