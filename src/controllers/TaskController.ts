import type { Request, Response } from "express";
import Task from "../models/Task";
import Project from "../models/Project";
import { Types } from "mongoose";

export class TaskController {

    static error = new Error()

    static addTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body)
            task.project = req.project._id as Types.ObjectId
            req.project.tasks.push(task._id as Types.ObjectId)
            await Promise.allSettled([task.save(), req.project.save()])
            res.status(201).json({message: 'Tarea Creada Correctamente'})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({ project: req.project._id }).select("-createdAt -updatedAt -__v").populate('project')
            res.json(tasks)
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task._id)
                            .populate({ path: 'completedBy.user', select: '_id name email'})
                            .populate({ path: 'notes', populate: { path: 'createdBy', select: '_id name email'}})
            res.json(task)
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            req.task.name = req.body.name
            req.task.description = req.body.description
            const updatedTask = await req.task.save()
            res.json({message: 'Tarea Actualizada Correctamente'})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task._id.toString())
            await Promise.allSettled([req.task.deleteOne(), req.project.save()])
            res.json({message: 'Tarea Eliminada'})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        const { status } = req.body
        try {
            req.task.status = status

            req.task.completedBy.push({
                user: req.user._id as Types.ObjectId,
                status: status,
                completedAt: new Date()
            })
            await req.task.save()
            res.json({message: 'Estado actualizado'})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}