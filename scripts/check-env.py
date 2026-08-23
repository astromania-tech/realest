from dotenv import load_dotenv
import os

# Load the environment variables from the.env file
load_dotenv()

# Access the environment variables
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_url = os.getenv('DATABASE_URL')
dir_url = os.getenv('DIRECT_URL')

print(f"DB Host: {db_host}")
print(f"DB Port: {db_port}")
print(f"DB User: {db_user}")
print(f"DB Password: {db_password}")
print(f"DB Connection URL: {db_url}")
print(f"DB Direct Connection URL: {dir_url}")
