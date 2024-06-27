import colors from "colors";
import server from "./server";

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(colors.bgBlue.bold(`\nServer running on port ${PORT}`));
})