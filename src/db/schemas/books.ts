import { relations } from 'drizzle-orm';
import { serial, varchar, timestamp, pgTable, text, integer } from 'drizzle-orm/pg-core';

export const authors = pgTable('authors', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    bio: text('bio'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const authorsRelations = relations(authors, ({ many }) => ({
    books: many(books),
}));

export const books = pgTable('books', {
    id: serial('id').primaryKey(),
    title: varchar('title').notNull(),
    description: text('description'),
    authorId: integer('author_id')
        .notNull()
        .references(() => authors.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const booksRelations = relations(books, ({ one }) => ({
    author: one(authors, {
        fields: [books.authorId],
        references: [authors.id],
    }),
}));
