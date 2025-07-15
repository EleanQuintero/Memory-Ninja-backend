import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Params } from "zod/v4/core/api.cjs";

export const validateID = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction):void  => {
    const result = schema.safeParse(req.params)

    if (!result.success) {
        const errorDetails = result.error.format();
        res.status(400).json({
          error: 'Datos inválidos',
          details: errorDetails,
        });
        return;
      }
    
      next();
}