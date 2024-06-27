import { token } from "morgan"
import { transporter } from "../config/nodemailer"

interface IEmail{
    email: string
    name: string
    token: string
}

export class AuthEmail {
    
    static sendConfirmationEmail = async (user: IEmail) => {
        const info = await transporter.sendMail({
            from: 'MyTasks <admin@mytasks.com>',
            to: user.email,
            subject: 'MyTasks - Confirma tu cuenta',
            text: 'MyTasks - Confirma tu cuenta',
            html: `
            <p>Hola ${user.name}, has creado tu cuenta en MyTasks, confirma tu cuenta con un solo click. </p>
            <p>Visita el siguiente enlace: </p>
            <a href="${process.env.FRONTEND_URL}/confirm-account">Confirmar Cuenta</a>
            <p>Copia el siguiente código de confirmación: <b>${user.token}</b></p>
            <p>Este código expira en 10 minutos</p>
            `
        })

        console.log('Mensaje enviado', info.messageId)
    }

    static sendRecoveryEmail = async (user: IEmail) => {
        const info = await transporter.sendMail({
            from: 'MyTasks <admin@mytasks.com>',
            to: user.email,
            subject: 'MyTasks - Recupera tu cuenta',
            text: 'MyTasks - Recupera tu cuenta',
            html: `
            <p>Hola ${user.name}, si has olvidado tu contraseña, genera una nueva contraseña con un solo click. </p>
            <p>Visita el siguiente enlace: </p>
            <a href="${process.env.FRONTEND_URL}/change-password">Cambiar Contraseña</a>
            <p>Copia el siguiente código de confirmación: <b>${user.token}</b></p>
            <p>Este código expira en 10 minutos</p>
            `
        })

        console.log('Mensaje enviado', info.messageId)
    }
}