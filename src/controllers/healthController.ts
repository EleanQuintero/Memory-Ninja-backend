import { Request, Response } from "express";


export const healtCheckController = async (req: Request, res: Response): Promise<void>=> {
    res.status(200).json({message: 'OK'})
    console.log("Han llamado al health")
}