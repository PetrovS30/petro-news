import { StorageService } from "../service/storage";
import type{ Request, Response } from "express";

export class StorageController {
    private readonly StorageService = new StorageService();

    public async upload(req: Request, res: Response) {
        try {
            const file = req.file;
            if(!file) return res.status(400).json({message: 'NO file provided'})
            res.status(200).json({
                name: file.originalname,
                file: file.mimetype
            });
        } catch (error) {
            res.status(500).json({message: 'Failed to upload file', error})
        }

    }
}