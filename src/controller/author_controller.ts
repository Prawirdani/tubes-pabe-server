import { Router, NextFunction, Request, Response } from 'express';
import db from '../db';
import { MakeResponse } from '../utils/response';
import { validateRequest } from '../utils/validator';
import { AuthorSchema, authorSchema } from '../schemas/author_schema';
import { authors, books } from '../db/schemas/books';
import { count, eq, getTableColumns } from 'drizzle-orm';
import { ErrNotFound } from '../utils/error';
import { AuthAccessToken } from './middleware/authenticate';

const authorRoute = Router();
authorRoute.get('/authors', getAuthors);
authorRoute.post('/authors', AuthAccessToken, createAuthor);
authorRoute.put('/authors/:id', AuthAccessToken, updateAuthor);
authorRoute.delete('/authors/:id', AuthAccessToken, deleteAuthor);
export default authorRoute;

async function getAuthors(req: Request, res: Response, next: NextFunction) {
  try {
    const authorsData = await db
      .select({
        ...getTableColumns(authors),
        totalBooks: count(books.id),
      })
      .from(authors)
      .leftJoin(books, eq(authors.id, books.authorId))
      .groupBy(authors.id);

    res.status(200).json(MakeResponse(authorsData));
  } catch (error) {
    next(error);
  }
}

async function createAuthor(req: Request, res: Response, next: NextFunction) {
  try {
    validateRequest(authorSchema, req.body);
    const request = req.body as AuthorSchema;

    const updatedAt = new Date();
    const author = await db
      .insert(authors)
      .values({
        ...request,
        updatedAt,
      })
      .returning();

    res.status(201).json(MakeResponse(author, 'Author berhasil dibuat!'));
  } catch (error) {
    next(error);
  }
}

async function updateAuthor(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    validateRequest(authorSchema, req.body);
    const request = req.body as AuthorSchema;

    const author = await db
      .update(authors)
      .set(request)
      .where(eq(authors.id, Number(id)))
      .returning();

    res.status(200).json(MakeResponse(author, 'Author berhasil diupdate!'));
  } catch (error) {
    next(error);
  }
}

async function deleteAuthor(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;

    const author = await db
      .select({
        ...getTableColumns(authors),
        totalBooks: count(books.id),
      })
      .from(authors)
      .leftJoin(books, eq(authors.id, books.authorId))
      .groupBy(authors.id)
      .where(eq(authors.id, Number(id)));

    // query above will return array of author, throw author not found if length of array is 0
    if (author.length === 0) {
      throw ErrNotFound('Author tidak ditemukan');
    }

    if (author[0].totalBooks > 0) {
      throw ErrNotFound('Author tidak bisa dihapus karena masih memiliki buku');
    }

    await db.delete(authors).where(eq(authors.id, Number(id)));

    res.status(200).json(MakeResponse(null, 'Author berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}
