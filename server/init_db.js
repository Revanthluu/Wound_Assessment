import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDb = async () => {
    try {
        const schemaPath = path.join(__dirname, '../database_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split queries by semicolon to execute them one by one if there are multiple
        const queries = schema.split(';').filter(q => q.trim());

        for (const query of queries) {
            if (query.trim()) {
                await db.query(query);
                console.log('Executed query:', query.substring(0, 50) + '...');
            }
        }

        console.log('Database initialized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
};

initDb();
