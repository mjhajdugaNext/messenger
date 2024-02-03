import { Schema } from 'joi';

export abstract class BaseError extends Error {
  public readonly httpCode: number;
  public readonly isOperational: boolean;
  public readonly logging: boolean;

  constructor(params?: { message: string; httpCode: number; isOperational: boolean; logging: boolean }) {
    super(params?.message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.httpCode = params?.httpCode;
    this.isOperational = params?.isOperational;
    this.logging = params?.logging;

    // Error.captureStackTrace(this);
  }
}

export class ApiError extends BaseError {
  constructor(params?: { message: string; httpCode?: number; logging?: boolean }) {
    super({
      message: params?.message || 'Internal server error',
      httpCode: params?.httpCode || 500,
      isOperational: true,
      logging: params?.logging || false,
    });
  }
}

export class MongooseError extends BaseError {
  constructor(params?: { message: string; httpCode?: number; logging?: boolean }) {
    super({
      message: params?.message || 'Internal server error',
      httpCode: params?.httpCode || 500,
      isOperational: true,
      logging: params?.logging || false,
    });
  }
}

interface ValidationErrorStructure {
  message: string;
  path: string[];
  type: string,
  context: any,
}

export class ValidationError extends BaseError {
  public readonly errors: ValidationErrorStructure[];

  constructor(params?: { message: string; httpCode?: number; logging?: boolean; errors?: ValidationErrorStructure[] }) {

    super({
      message: params?.message || 'Validation error',
      httpCode: params?.httpCode || 422,
      isOperational: true,
      logging: params?.logging || false,
    });

    this.errors = params?.errors || [];
  }
}

export async function validate(validationSchema: Schema, args: any) {
  try {
    const result = await validationSchema.validateAsync(args);
    return result;

  } catch (error) {
    throw new ValidationError({ message: error.message, errors: error.details })
  }
}
