import dotenv from "dotenv";
dotenv.config();

interface Config {
  PORT: number;
  NODE_ENV: string;
  JWT_SECRET: string;
  REFRESH_SECRET: string;
  MONGO_URI: string;
  CLOUDINARY_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_URL: string;
  PAYMONGO_PUBLIC_KEY_TEST: string;
  PAYMONGO_SECRET_KEY_TEST: string;
  PAYMONGO_SECRET_KEY_TEST_BASE64: string;
}

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const config: Config = {
  PORT: Number(process.env.PORT) || 3005,
  NODE_ENV: getEnvVar("NODE_ENV"),
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  REFRESH_SECRET: getEnvVar("REFRESH_SECRET"),
  MONGO_URI: getEnvVar("MONGO_URI"),
  CLOUDINARY_NAME: getEnvVar("CLOUDINARY_NAME"),
  CLOUDINARY_API_KEY: getEnvVar("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnvVar("CLOUDINARY_API_SECRET"),
  CLOUDINARY_URL: getEnvVar("CLOUDINARY_URL"),
  PAYMONGO_PUBLIC_KEY_TEST: getEnvVar("PAYMONGO_PUBLIC_KEY_TEST"),
  PAYMONGO_SECRET_KEY_TEST: getEnvVar("PAYMONGO_SECRET_KEY_TEST"),
  PAYMONGO_SECRET_KEY_TEST_BASE64: getEnvVar("PAYMONGO_SECRET_KEY_TEST_BASE64"),
};

export default config;
