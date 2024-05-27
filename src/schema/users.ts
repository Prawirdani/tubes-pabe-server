import {
    serial,
    varchar,
    timestamp,
    pgTable,
    pgEnum,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'operator']);
export const users = pgTable('users', {
    id: serial('id'),
    nama: varchar('nama', { length: 100 }),
    email: varchar('email', { length: 100 }).unique(),
    password: varchar('password', { length: 256 }),
    role: roleEnum('role').default('operator'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
