import mongoose from "mongoose";
import colors from "colors";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL);
        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(colors.magenta.bold(`Conexión a la base de datos exitosa en: ${url}`));
    } catch (error) {
        console.log(colors.bgRed.bold(`Error de conexión a la base de datos: ${error}`));
        process.exit(1)
    }
}