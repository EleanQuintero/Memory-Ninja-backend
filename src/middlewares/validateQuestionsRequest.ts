import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateBody = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction):void  => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
        const errorDetails = result.error.format();
        res.status(400).json({
          error: 'Datos inválidos',
          details: errorDetails,
        });
        return;
      }
    
      req.body = result.data; // ✅ datos parseados y tipados
      next();
}