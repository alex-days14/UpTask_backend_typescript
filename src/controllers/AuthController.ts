import type { Request, Response } from "express"
import User, { IUser } from "../models/User"
import { hashPassword, verifyPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import Token from "../models/Token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"
import { IProject } from "../models/Project"

type AuthControllerBody = {
    current_password: string
    password: string
    password_confirmation: string
}

export class AuthController{

    private static error = new Error()

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password } = req.body;

            // Crear usuario
            const user = new User(req.body);

            // Hash password
            user.password = await hashPassword(password);
            
            // Generar token de confirmación
            const token = new Token();
            token.token = generateToken();
            token.user = user._id;

            //enviar el email
            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });

            // Guardar usuario y token
            await Promise.allSettled([user.save(), token.save()])

            res.status(201).json({message: 'Cuenta Creada, Revisa tu Correo para Confirmarla'})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;

            const tokenExists = await Token.findOne({token})
            if(!tokenExists){
                this.error.message = 'Token inválido. Genera otro código de confirmación';
                return res.status(401).json({error: this.error.message})
            }

            const user = await User.findById(tokenExists.user)
            if(!user){
                this.error.message = 'Usuario no encontrado';
                return res.status(404).json({error: this.error.message})
            }

            user.confirmed = true;

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.status(200).json({message: 'Cuenta Confirmada'})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static login = async(req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const userExists = await User.findOne({email})
            if(!userExists){
                this.error.message = 'Usuario no encontrado';
                return res.status(404).json({error: this.error.message})
            }
            if(!userExists.confirmed){
                const token = new Token();
                token.user = userExists._id;
                token.token = generateToken();
                await token.save();
                await AuthEmail.sendConfirmationEmail({
                    email: userExists.email,
                    name: userExists.name,
                    token: token.token
                });

                this.error.message = 'Usuario no confirmado, revisa tu email';
                return res.status(401).json({error: this.error.message})
            }

            // Revisar password
            const isPasswordCorrect = await verifyPassword(password, userExists.password)
            if(!isPasswordCorrect){
                this.error.message = 'Credenciales incorrectas';
                return res.status(401).json({error: this.error.message})
            }

            const token = generateJWT({
                id: userExists._id,
                email: userExists.email,
                name: userExists.name
            });
            
            res.json(token)
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            // Buscar usuario
            const userExists = await User.findOne({email});
            if(!userExists){
                this.error.message = 'Usuario no encontrado';
                return res.status(404).json({error: this.error.message})
            }
            if(userExists.confirmed){
                this.error.message = 'Este correo ya está confirmado.';
                return res.status(403).json({error: this.error.message})
            }
            
            // Generar token de confirmación
            const token = new Token();
            token.token = generateToken();
            token.user = userExists._id;

            //enviar el email
            await AuthEmail.sendConfirmationEmail({
                email: userExists.email,
                name: userExists.name,
                token: token.token
            });

            // Guardar usuario y token
            await Promise.allSettled([userExists.save(), token.save()])

            res.status(201).json({message: 'Código Generado, Revisa tu Correo.'})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static recoverAccount = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            // Buscar usuario
            const userExists = await User.findOne({email});
            if(!userExists){
                this.error.message = 'Usuario no encontrado';
                return res.status(404).json({error: this.error.message})
            }
            const tokenExists = await Token.findOne({user: userExists._id})
            /* if(tokenExists){
                await tokenExists.deleteOne();
            } */
            
            // Generar token de recuperación
            const token = new Token();
            token.token = generateToken();
            token.user = userExists._id;
            await token.save();

            //enviar el email
            await AuthEmail.sendRecoveryEmail({
                email: userExists.email,
                name: userExists.name,
                token: token.token
            });

            res.status(201).json({message: 'Revisa tu email para recuperar tu cuenta'})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateRecoveryToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;

            const tokenExists = await Token.findOne({token})
            if(!tokenExists){
                this.error.message = 'Token inválido. Genera otro código de confirmación';
                return res.status(401).json({error: this.error.message})
            }

            res.status(200).json({message: 'Código válido, crea tu nueva contraseña'})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static changePassword = async (req: Request, res: Response) => {
        const { token } = req.params;
        const { password } = req.body;

        try {
            const tokenExists = await Token.findOne({token})
            if(!tokenExists){
                this.error.message = 'Token inválido. Genera otro código de confirmación';
                return res.status(401).json({error: this.error.message})
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password);

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.status(200).json({message: 'Contraseña Reestablecida Correctamente'})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static user = async (req: Request, res: Response) => {
        return res.status(200).json(req.user)
    }

    static updateProfile = async (req: Request<{}, {}, Pick<IUser, 'name' | 'email'>>, res: Response) => {
        const { name, email } = req.body

        try {
            const userExists = await User.findOne({ email })
            if(userExists && userExists._id.toString() !== req.user._id.toString()){
                this.error.message = 'Ya existe un usuario con este email';
                return res.status(409).json({error: this.error.message})
            }

            req.user.name = name
            req.user.email = email
            await req.user.save()
            res.json({ message: 'Perfil Actualizado' })
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateCurrentUserPassword = async (req: Request<{}, {}, Pick<AuthControllerBody, 'current_password' | 'password'>>, res: Response) => {
        const { current_password, password } = req.body

        try {
            const user = await User.findById(req.user._id)
            const isPasswordCorrect = await verifyPassword(current_password, user.password)
            if(!isPasswordCorrect){
                this.error.message = 'El password actual es incorrecto';
                return res.status(401).json({error: this.error.message})
            }

            user.password = await hashPassword(password)

            await user.save()
            res.json({ message: 'Password Actualizado Correctamente' })
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static checkPassword = async (req: Request<{}, {}, Pick<AuthControllerBody, 'password'>>, res: Response) => {
        const { password } = req.body

        try {
            const user = await User.findById(req.user._id)
            const isPasswordCorrect = await verifyPassword(password, user.password)
            if(!isPasswordCorrect){
                this.error.message = 'El password es incorrecto';
                return res.status(401).json({error: this.error.message})
            }

            res.json({ message: 'Password Correcto' })
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}
