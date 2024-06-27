import type { Request, Response, NextFunction } from "express"

export const isManager = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error();
    if(req.user._id.toString() !== req.project.manager.toString()) {
        error.message = 'Acción No Válida'
        return res.status(400).json({error: error.message})
    }
    next()
}