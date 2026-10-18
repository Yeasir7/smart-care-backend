import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed";

const bootstrap = async() => {
    try {
        const port = Number(envVars.PORT) || 10000;
        app.listen(port, "0.0.0.0", () => {
            console.log(`Server is running on http://0.0.0.0:${port}`);
        });
        await seedSuperAdmin();
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

bootstrap();