import type { Request, Response } from "express";
import Note, {INote} from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {

    static error = new Error()

    static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
        
        const { content } = req.body;
        const note = new Note()
        note.content = content
        note.createdBy = req.user._id as Types.ObjectId
        note.task = req.task._id as Types.ObjectId

        req.task.notes.push(note._id as Types.ObjectId)

        try{
            await Promise.allSettled([note.save(), req.task.save()])
            res.json({ message: "Nota creada" })
        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Hubo un error"})
        }
    }

    static getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({ task: req.task._id})
            res.json(notes)
        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Hubo un error"})
        }
    }

    static removeTaskNote = async (req: Request<NoteParams>, res: Response) => {
        try {
            const { noteId } = req.params
            const note = await Note.findById(noteId)
            if(!note){
                this.error.message = "Nota no encontrada"
                return res.status(404).json({error: this.error.message})
            }
            if(!req.task.notes.includes(note._id as Types.ObjectId)){
                this.error.message = "No tienes acceso a esta nota"
                return res.status(401).json({error: this.error.message})
            }
            if(note.createdBy.toString() !== req.user._id.toString()){
                this.error.message = "No tienes permiso para eliminar esta nota"
                return res.status(401).json({error: this.error.message})
            }

            req.task.notes = req.task.notes.filter(note => note.toString() !== noteId.toString())

            await Promise.allSettled([note.deleteOne(), req.task.save()])
            res.json({ message: "Nota eliminada" })
        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Hubo un error"})
        }
    }
}