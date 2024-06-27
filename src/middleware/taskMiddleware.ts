import { body } from "express-validator"
import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";
import { validMongoId } from "./validationMiddleware";

declare global{
    namespace Express{
        interface Request{
            task: ITask
        }
    }
}

export const taskExists = async (req: Request, res: Response, next: NextFunction) => {
    
    const error = new Error();
    const { taskId } = req.params

    const noMongoId = validMongoId('taskId', taskId)
    if(noMongoId) return res.status(400).json(noMongoId)

    try {
        const task = await Task.findById(taskId)
        if(!task) {
            error.message = 'Tarea no encontrada'
            return res.status(404).json({error: error.message})
        }
        req.task = task
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export const verifyTaskInProject = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error();
    if(req.task.project.toString() !== req.project._id.toString()) {
        error.message = 'Acción No Válida'
        return res.status(400).json({error: error.message})
    }
    next()
}

export const taskValidation = () => {
    return [
        body('name').notEmpty().withMessage('El nombre del proyecto es requerido')
        .isString().withMessage('Nombre de proyecto inválido'),
        body('description').notEmpty().withMessage('La descripción del proyecto es requerida')
        .isString().withMessage('Descripción inválida')
    ]
}