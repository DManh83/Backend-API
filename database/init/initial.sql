SELECT 'CREATE DATABASE babybook'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'babybook')\gexec
GRANT ALL PRIVILEGES ON DATABASE babybook TO postgres;
