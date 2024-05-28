import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { users } from './schemas/users';
import * as books from './schemas/books';

const pg = postgres({
    host: process.env.DB_HOST ?? 'localhost',
    database: process.env.DB_NAME ?? 'test',
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    port: Number(process.env.DB_PORT) ?? 5432,
});

const db = drizzle(pg, { schema: { users, ...books } });
export default db;
