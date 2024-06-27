import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validationMiddleware";
import { authenticate, confirmUserValidation, createUserValidation, isNewUser, loginUserValidation, requestCodeValidation } from "../middleware/authMiddleware";

const router = Router()

router.post('/create-account', 
    createUserValidation(),
    handleInputErrors,
    isNewUser,
    AuthController.createAccount
)

router.post('/confirm-account',
    confirmUserValidation(),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login',
    loginUserValidation(),
    handleInputErrors,
    AuthController.login
)

router.post('/request-code',
    requestCodeValidation(),
    handleInputErrors,
    AuthController.requestConfirmationCode
)

router.post('/recover-account',
    requestCodeValidation(),
    handleInputErrors,
    AuthController.recoverAccount
)

router.post('/recover-account/validate-recovery-token',
    body('token')
            .notEmpty().withMessage('El token es requerido')
            .isString().withMessage('El token es inválido'),
    handleInputErrors,
    AuthController.validateRecoveryToken
)

router.post('/recover-account/change-password/:token',
    param('token')
        .isNumeric().withMessage('El token es inválido'),
    body('password')
    .isLength({min: 8}).withMessage('El password debe tener mínimo 8 caractéres'),
    body('password_confirmation')
    .custom((value, { req }) => {
        if(value !== req.body.password) throw new Error('Los passwords no coinciden')
        return true
    }),
    handleInputErrors,
    AuthController.changePassword
)

router.get('/user',
    authenticate,
    AuthController.user
)

/* Profile */

router.put('/profile', 
    authenticate,
    body('name')
            .notEmpty().withMessage('El nombre es requerido')
            .isString().withMessage('El nombre es inválido'),
    body('email')
        .notEmpty().withMessage('El correo es requerido')
        .isEmail().withMessage('El correo es inválido'),
    handleInputErrors,
    AuthController.updateProfile
)

router.post('/profile/change-password', 
    authenticate,
    body('current_password')
            .notEmpty().withMessage('El password actual es requerido'),
    body('password')
        .isLength({min: 8}).withMessage('El password debe tener mínimo 8 caractéres'),
    body('password_confirmation')
        .custom((value, { req }) => {
            if(value !== req.body.password) throw new Error('Los passwords no coinciden')
            return true
        }),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password', 
    authenticate,
    body('password')
        .notEmpty().withMessage('El password es requerido'),
    handleInputErrors,
    AuthController.checkPassword
)
export default router;