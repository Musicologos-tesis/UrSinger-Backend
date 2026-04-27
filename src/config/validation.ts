import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  CORS_ORIGIN: Joi.string().required(),
  JWT_SECRET: Joi.string().default('ursinger-secret-key-change-in-production'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  ML_SERVICE_URL: Joi.string().default('http://localhost:8000'),
});