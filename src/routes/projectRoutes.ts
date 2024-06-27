import { Router } from "express";
import { body, param } from "express-validator";
import { isManager } from "../middleware/commonMiddleware";
import { taskExists, taskValidation, verifyTaskInProject } from "../middleware/taskMiddleware";
import { projectExists, projectValidation } from "../middleware/projectMiddleware";
import { handleInputErrors, isMongoId } from "../middleware/validationMiddleware";
import { authenticate } from "../middleware/authMiddleware";
import { ProjectController } from "../controllers/ProjectController";
import { TaskController } from "../controllers/TaskController";
import { TeamController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router();
//* /api/projects

router.use(authenticate)

router.route('/')
.get(
    ProjectController.getAllProjects
)
.post(
    projectValidation(),
    handleInputErrors, 
    ProjectController.addProject
)



//*    /api/projects/:id
router.param('id', projectExists)

router.route('/:id',)
.get(
    ProjectController.getProjectById
)
.put(
    isManager,
    projectValidation(),
    handleInputErrors,
    ProjectController.updateProject
)
.delete(
    isManager,
    ProjectController.deleteProject
);

//* Tareas
//* /api/projects/:id/tasks

router.route('/:id/tasks')
.get(
    TaskController.getProjectTasks
)
.post(
    isManager,
    taskValidation(),
    handleInputErrors,
    TaskController.addTask
)

//*   /api/projects/:id/tasks/:taskId
router.param('taskId', taskExists)
router.param('taskId', verifyTaskInProject)

router.route('/:id/tasks/:taskId')
.get(
    TaskController.getTaskById
)
.put(
    isManager,
    taskValidation(),
    handleInputErrors,
    TaskController.updateTask
)
.patch(
    isManager,
    body('status').notEmpty().isString().withMessage('El estado es requerido'),
    handleInputErrors,
    TaskController.updateStatus
)
.delete(
    isManager,
    TaskController.deleteTask
)

//* Teams
router.post("/:id/team/find",
    body('email')
            .notEmpty().withMessage('El email es requerido')
            .isEmail().withMessage('El email es inválido'),
    handleInputErrors,
    TeamController.findUserByEmail
)

router.route("/:id/team")
.post(
    body('id')
            .isMongoId().withMessage('El ID es inválido')
            .notEmpty().withMessage('El ID es requerido'),
    handleInputErrors,
    TeamController.addTeamMember
)
.get(
    TeamController.getTeamMembers
)

router.delete("/:id/team/:memberId",
    param('memberId')
            .isMongoId().withMessage('El ID es inválido')
            .notEmpty().withMessage('El ID es requerido'),
    handleInputErrors,
    TeamController.removeTeamMember
)

/* Notes */
router.route("/:id/tasks/:taskId/notes")
.post(
    body('content')
            .notEmpty().withMessage('La nota es requerida')
            .isString().withMessage('La nota debe ser un texto'),
    handleInputErrors,
    NoteController.createNote
)
.get(
    NoteController.getTaskNotes
)

router.delete("/:id/tasks/:taskId/notes/:noteId",
    param('noteId')
            .isMongoId().withMessage('El ID es inválido')
            .notEmpty().withMessage('El ID es requerido'),
    handleInputErrors,
    NoteController.removeTaskNote
)

export default router;