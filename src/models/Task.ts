import mongoose, { Schema, Document, Types } from "mongoose";
import type { INote } from "./Note";
import Note from "./Note";

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed',
} as const

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]

export interface ITask extends Document {
    name: string
    description: string
    project: Types.ObjectId
    notes: Types.ObjectId[]
    status: TaskStatus,
    completedBy: {
        user: Types.ObjectId,
        status: TaskStatus,
        completedAt: Date
    }[]
}

const TaskSchema: Schema = new Schema({
    name : { type: String, required: true, trim: true },
    description : { type: String, required: true, trim: true },
    project: { type: Types.ObjectId, ref: 'Project' },
    notes: [
        { type: Types.ObjectId, ref: 'Note' }
    ],
    status: { 
        type: String, 
        required: true, 
        enum: Object.values(taskStatus), 
        default: taskStatus.PENDING 
    },
    completedBy: [
        {
            user: { type: Types.ObjectId, ref: 'User', default: null },
            status: { 
                type: String, 
                required: true, 
                enum: Object.values(taskStatus), 
                default: taskStatus.PENDING 
            },
            completedAt: {
                type: Date,
                default: null
            }
        }
    ]
}, { timestamps: true })

/* Middlewares */
TaskSchema.pre('deleteOne', { document: true, query: false}, async function (){
    const taskId = this._id;
    if(!taskId) return;

    await Note.deleteMany({ task: taskId});
})

const Task = mongoose.model<ITask>('Task', TaskSchema);


export default Task;