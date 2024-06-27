import type { Request, Response, NextFunction } from "express"
import { validationResult, param, body } from "express-validator"
import { isValidObjectId } from "mongoose";

const idOptions = {
    id: {msg: 'ID de proyecto inválido', id: 'id'},
    taskId: {msg: 'ID de tarea inválido', id: 'taskId'},
} as const

type IdOptions = typeof idOptions[keyof typeof idOptions]['id'];

export const isMongoId = (id: IdOptions) => {
    return param(id).isMongoId().withMessage(idOptions[id].msg)
}

export const validMongoId = (option: IdOptions, id: string) => {
    if(!isValidObjectId(id)){
        return {error: idOptions[option].msg}
    }
}

export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    next()
}