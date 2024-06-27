import { body } from "express-validator"
import type { Request, Response, NextFunction } from "express"
import User, { IUser } from "../models/User";
import JWT from "jsonwebtoken";

declare global{
    namespace Express{
        interface Request{
            user?: IUser
        }
    
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if(!bearer){
        const error = new Error('No autorizado')
        return res.status(401).json({error: error.message})
    }
    
    const token = bearer.split(' ')[1]

    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET)

        if(typeof decoded == "object" && decoded.id){
            const user = await User.findById(decoded.id).select('_id name email')
            if(user){
                req.user = user
            }else{
                res.status(500).json({error: 'Token no válido'})
            }
        }
    } catch (error) {
        res.status(500).json({error: 'Token no válido'})
    }

    next()
}

export const isNewUser = async (req: Request, res: Response, next: NextFunction) => {
    
    const error = new Error();
    const { email } = req.body

    try {
        // Verificar si el usuario ya existe
        const userExists = await User.findOne({email})
        if(userExists){
            error.message = "Este email ya está asociado a una cuenta"
            return res.status(409).json({error: error.message})
        }
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export const createUserValidation = () => {
    return [
        body('name')
            .notEmpty().withMessage('El nombre es requerido')
            .isString().withMessage('El nombre es inválido'),
        body('email')
            .notEmpty().withMessage('El correo es requerido')
            .isEmail().withMessage('El correo es inválido'),
        body('password')
            .isLength({min: 8}).withMessage('El password debe tener mínimo 8 caractéres'),
        body('password_confirmation')
            .custom((value, { req }) => {
                if(value !== req.body.password) throw new Error('Los passwords no coinciden')
                return true
            })
    ]
}

export const confirmUserValidation = () => {
    return [
        body('token')
            .notEmpty().withMessage('El token es requerido')
            .isString().withMessage('El token es inválido')
    ]
}

export const loginUserValidation = () => {
    return [
        body('email')
            .notEmpty().withMessage('El email es requerido')
            .isEmail().withMessage('El email es inválido'),
        body('password')
            .notEmpty().withMessage('El password es requerido')
            .isLength({min: 8}).withMessage('Alguna de tus credenciales es incorrecta')
    ]
}

export const requestCodeValidation = () => {
    return [
        body('email')
            .notEmpty().withMessage('El email es requerido')
            .isEmail().withMessage('El email es inválido'),
    ]
}