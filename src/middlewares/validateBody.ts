import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validateBody = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction): void => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    const errorDetails = z.prettifyError(result.error);
    res.status(400).json({
      error: 'Datos inválidos',
      details: errorDetails,
    });
    return;
  }

  req.body = result.data; // ✅ datos parseados y tipados
  next();
}