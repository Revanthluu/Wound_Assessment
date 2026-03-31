import db from './db.js';

async function migrate() {
    try {
        console.log("Checking columns for 'users' table...");
        const [columns] = await db.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'",
            [process.env.DB_NAME || 'mediwound_ai']
        );

        const loadedColumns = columns.map(c => c.COLUMN_NAME.toLowerCase());
        console.log("Existing columns:", loadedColumns);

        const adds = [];
        if (!loadedColumns.includes('age')) adds.push("ADD COLUMN age INT");
        if (!loadedColumns.includes('experience')) adds.push("ADD COLUMN experience VARCHAR(50)");
        if (!loadedColumns.includes('gender')) adds.push("ADD COLUMN gender VARCHAR(20)");
        if (!loadedColumns.includes('license_no')) adds.push("ADD COLUMN license_no VARCHAR(100)");

        if (adds.length > 0) {
            const query = `ALTER TABLE users ${adds.join(', ')}`;
            console.log("Executing:", query);
            await db.query(query);
            console.log("Migration successful!");
        } else {
            console.log("All required columns already exist.");
        }
    } catch (e) {
        console.error("Migration Failed:", e);
    } finally {
        process.exit(0);
    }
}

migrate();
