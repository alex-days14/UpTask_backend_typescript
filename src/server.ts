import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import morgan from "morgan";
import { connectDB } from "./config/db";
import corsOptions from "./config/cors";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";

dotenv.config()

connectDB();

const server = express();
// Logging
server.use(morgan('dev'))

// Leer datos de forms
server.use(express.json())

// Habilitando CORS
export const WHITELIST = [
    process.env.FRONTEND_URL,
    process.env.THIS_URL
]
server.use(cors(corsOptions))

//Routes
server.use('/api/auth', authRoutes)
server.use('/api/projects', projectRoutes)

export default server;