require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");
const createDefaultAdmin = require("./utils/createDefaultAdmin");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDatabase();
        await createDefaultAdmin();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
