import dotenv from "dotenv";
dotenv.config();

interface Config {
  PORT: number;
  JWT_SECRET: string;
  REFRESH_SECRET: string;
  MONGO_URI: string;
  CLOUDINARY_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_URL: string;
}

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const config: Config = {
  PORT: Number(process.env.PORT) || 3005,
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  REFRESH_SECRET: getEnvVar("REFRESH_SECRET"),
  MONGO_URI: getEnvVar("MONGO_URI"),
  CLOUDINARY_NAME: getEnvVar("CLOUDINARY_NAME"),
  CLOUDINARY_API_KEY: getEnvVar("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnvVar("CLOUDINARY_API_SECRET"),
  CLOUDINARY_URL: getEnvVar("CLOUDINARY_URL"),
};

export default config;
