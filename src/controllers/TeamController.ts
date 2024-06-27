import type { Request, Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';

export class TeamController{
    static error = new Error();

    static findUserByEmail = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const project = req.project;

            const user = await User.findOne({ email }).select("_id name email")
            if(!user){
                this.error.message = "Usuario no encontrado";
                return res.status(404).json({error: this.error.message})
            }
            if(project.manager.toString() === user._id.toString()){
                this.error.message = 'Este usuario ya es el administrador del proyecto'
                return res.status(409).json({error: this.error.message})
            }
            if(project.team.some(memberId => memberId.toString() === user._id.toString())){
                this.error.message = 'El usuario ya es miembro del equipo'
                return res.status(409).json({error: this.error.message})
            }

            res.json(user)
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }

    static addTeamMember = async (req: Request, res: Response) => {
        try {
            const { id: newMemberId } = req.body;
            const project = req.project;

            const newMember = await User.findById(newMemberId)
            if(!newMember){
                this.error.message = "Usuario no encontrado";
                return res.status(404).json({error: this.error.message})
            }
            if(project.manager.toString() !== req.user._id.toString()){
                this.error.message = 'Solo el administrador puede añadir miembros al equipo'
                return res.status(401).json({error: this.error.message})
            }
            if(project.team.some(memberId => memberId.toString() === newMemberId)){
                this.error.message = 'El usuario ya es miembro del equipo'
                return res.status(409).json({error: this.error.message})
            }

            project.team.push(newMemberId)
            await project.save()
            
            res.json({ message: "Miembro añadido al equipo" })
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }

    static removeTeamMember = async (req: Request, res: Response) => {
        try {
            const { memberId: id } = req.params;
            const project = req.project;
            console.log(id)
            const member = await User.findById(id)
            if(!member){
                this.error.message = "Usuario no encontrado";
                return res.status(404).json({error: this.error.message})
            }
            if(project.manager.toString() !== req.user._id.toString()){
                this.error.message = 'Solo el administrador puede añadir miembros al equipo'
                return res.status(401).json({error: this.error.message})
            }
            if(project.team.every(memberId => memberId.toString() !== id)){
                this.error.message = 'El usuario no es miembro del equipo'
                return res.status(409).json({error: this.error.message})
            }

            project.team = project.team.filter(memberId => memberId.toString() !== id)
            await project.save()
            
            res.json({ message: "Miembro eliminado del equipo" })
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }

    static getTeamMembers = async (req: Request, res: Response) => {
        try {
            const project = await Project.findById(req.project._id).populate('team', '_id name email');
            

            if(project.manager.toString() !== req.user._id.toString() && !project.team.some(memberId => memberId.toString() === req.user._id.toString())){
                this.error.message = 'No tienes acceso a este proyecto'
                return res.status(401).json({error: this.error.message})
            }
            
            res.json(project.team)
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }

}