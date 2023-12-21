import * as dotenv from 'dotenv';

// config use env
dotenv.config();

// environment
const NODE_ENV: string = process.env.NODE_ENV;
const PORT: number = +process.env.PORT;
const HASH: number = +process.env.HASH;

// database
const POSTGRES_HOST: string = process.env.POSTGRES_HOST;
const POSTGRES_PORT: number = +process.env.POSTGRES_PORT;
const POSTGRES_USER: string = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD: string = process.env.POSTGRES_PASSWORD;
const POSTGRES_DB: string = process.env.POSTGRES_DB;

const BASE_URL:string = process.env.BASE_URL;

// jwt
const ACCESS_TOKEN_SECRET: string = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRATION_TIME: string =
  process.env.ACCESS_TOKEN_EXPIRATION_TIME;
const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRATION_TIME: string =
  process.env.REFRESH_TOKEN_EXPIRATION_TIME;

// cloud
const CLOUD_NAME: string = process.env.CLOUD_NAME;
const API_KEY: string = process.env.API_KEY;
const API_SECRET: string = process.env.API_SECRET;

//google
const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID;

//Mailer
const MAILER_HOST: string = process.env.MAILER_HOST;
const MAILER_PORT: number = +process.env.MAILER_PORT;
const MAILER_HOST_USER: string = process.env.MAILER_HOST_USER;
const MAILER_HOST_PASSWORD: string = process.env.MAILER_HOST_PASSWORD;
const MAILER_FROM: string = process.env.MAILER_FROM;

//API
const API_URL: string = process.env.API_URL;
const API_ADMIN_URL: string = process.env.API_ADMIN_URL;
const API_VERSION: string = process.env.API_VERSION;

export {
  NODE_ENV,
  PORT,
  HASH,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION_TIME,
  CLOUD_NAME,
  API_KEY,
  API_SECRET,
  GOOGLE_CLIENT_ID,
  MAILER_HOST,
  MAILER_PORT,
  MAILER_HOST_USER,
  MAILER_HOST_PASSWORD,
  MAILER_FROM,
  API_URL,
  API_ADMIN_URL,
  API_VERSION,
  BASE_URL
};
