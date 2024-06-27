import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController{

    private static error = new Error()

    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    { manager: { $in: req.user._id } },
                    { team: { $in: req.user._id }}
                ]
            })
            res.json(projects)
        } catch (error) {
            console.log(error)
        }
    }

    static addProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        const user = req.user;

        project.manager = user._id as string

        try {
            await project.save()
            res.status(201).json({message: 'Proyecto Creado Correctamente'})
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        try {
            const project = await req.project.populate({
                path: 'tasks', 
                select: '-completedBy'
            })
            if(project.manager.toString() !== req.user._id.toString() && !project.team.includes(req.user._id as string)){
                this.error.message = 'No cuentas con los permisos necesarios para ver este proyecto'
                return res.status(401).json({error: this.error.message})
            }
            res.json(project)
        } catch (error) {
            console.log(error)
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        try {
            req.project.projectName = req.body.projectName
            req.project.clientName = req.body.clientName
            req.project.description = req.body.description

            await req.project.save()
            res.status(200).json({message: 'Proyecto Editado Correctamente'})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static deleteProject = async (req: Request, res: Response) => {

        try {
            await req.project.deleteOne()
            res.json({message: 'Proyecto eliminado'})
        } catch (error) {
            console.log(error)
        }
    }
}