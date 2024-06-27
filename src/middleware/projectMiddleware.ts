import type { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import Project, { IProject } from "../models/Project";
import { validMongoId } from "./validationMiddleware";

declare global {
    namespace Express {
        interface Request {
            project: IProject
        }
    }
}

export const projectExists = async (req: Request, res: Response, next: NextFunction) => {

    const error = new Error();
    const { id } = req.params;

    const noMongoId = validMongoId('id', id)
    if(noMongoId) return res.status(400).json(noMongoId)

    try {
        const project = await Project.findById(id)
        if(!project) {
            error.message = 'Proyecto no h encontrado'
            return res.status(404).json({error: error.message})
        }
        req.project = project
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export const projectValidation = () => {
    return [
        body('projectName').notEmpty().withMessage('El nombre del proyecto es requerido')
        .isString().withMessage('Nombre de proyecto inválido'), 
        body('clientName').notEmpty().withMessage('El nombre del cliente es requerido')
        .isString().withMessage('Nombre del cliente inválido'), 
        body('description').notEmpty().withMessage('La descripción del proyecto es requerida')
        .isString().withMessage('Descripción inválida')
    ]
}