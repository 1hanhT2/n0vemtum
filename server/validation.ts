
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Date validation schema
export const dateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Date must be in YYYY-MM-DD format"
);

// Sanitize string inputs
export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, "");
}

// Validate date parameters
export function validateDateParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const date = req.params[paramName];
    try {
      dateSchema.parse(date);
      next();
    } catch (error) {
      res.status(400).json({ 
        message: `Invalid ${paramName} format`,
        details: "Date must be in YYYY-MM-DD format"
      });
    }
  };
}

// Validate numeric parameters
export function validateNumericParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    const numValue = parseInt(value);
    
    if (isNaN(numValue) || numValue < 1) {
      return res.status(400).json({ 
        message: `Invalid ${paramName}`,
        details: "Must be a positive integer"
      });
    }
    
    req.params[paramName] = numValue.toString();
    next();
  };
}

// Sanitize request body
export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    const keys = Object.keys(req.body);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  next();
}
