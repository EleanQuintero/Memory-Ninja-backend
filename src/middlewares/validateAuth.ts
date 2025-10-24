import { verifyToken } from "@clerk/backend";
import { NextFunction, Request, Response } from "express";
import { VerifiedToken } from "../models/interfaces/auth";
import { env } from "../config/env";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                userLevel?: string;
                // otros campos necesarios
            };
        }
    }
}


export const validateAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Token de autorización no proporcionado' })
            return
        }

        const verifiedToken = await verifyToken(token, {
            jwtKey: env.CLERK_JWT_KEY,
        })

        const tokenData = verifiedToken as unknown as VerifiedToken

        const userId = tokenData.sub;
        const userLevel = tokenData.pla.split(':')[1]

        req.user = {
            id: userId,
            userLevel: userLevel,
        }

        next()
    } catch (error) {
        console.error('Error al validar el token:', error);
        res.status(401).json({ message: 'Token de autorización inválido o expirado' });

    }


}