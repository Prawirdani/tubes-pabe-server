import { Router, NextFunction, Request, Response } from 'express';
import db from '../db';
import { MakeResponse } from '../utils/response';
import { validateRequest } from '../utils/validator';
import { BookCreateSchema, bookCreateSchema } from '../schemas/book_schema';
import { authors, books } from '../db/schemas/books';
import { SQL, and, eq, ilike, or } from 'drizzle-orm';
import { ErrNotFound } from '../utils/error';
import { AuthAccessToken } from './middleware/authenticate';

const booksRoute = Router();
booksRoute.get('/books', getBooks);
booksRoute.post('/books', AuthAccessToken, createBook);
booksRoute.put('/books/:id', AuthAccessToken, updateBook);
booksRoute.delete('/books/:id', AuthAccessToken, deleteBook);
export default booksRoute;

async function getBooks(req: Request, res: Response, next: NextFunction) {
  try {
    const search = parseBookSearchQuery(req);
    const books = await db.query.books.findMany({
      where: search,
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            bio: true,
          },
        },
      },
    });
    res.status(200).json(MakeResponse(books));
  } catch (error) {
    next(error);
  }
}

async function createBook(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate request body
    validateRequest(bookCreateSchema, req);

    // Check if author exists
    const author = await db.query.authors.findFirst({
      where: eq(authors.id, req.body.authorId),
    });

    if (!author) {
      throw ErrNotFound('Penulis tidak ditemukan');
    }

    const book = await db.insert(books).values(req.body).returning();
    res.status(201).json(MakeResponse(book, 'Buku berhasil ditambahkan'));
  } catch (error) {
    next(error);
  }
}

async function updateBook(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = Number(req.params.id);

    // Validate request body
    validateRequest(bookCreateSchema, req);
    const request = req.body as BookCreateSchema;

    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
    });

    if (!book) {
      throw ErrNotFound('Buku tidak ditemukan');
    }

    // Check if author exists
    const author = await db.query.authors.findFirst({
      where: eq(authors.id, req.body.authorId),
    });

    if (!author) {
      throw ErrNotFound('Penulis tidak ditemukan');
    }

    // Update book
    const updatedAt = new Date();
    const updatedBook = await db
      .update(books)
      .set({
        ...request,
        updatedAt,
      })
      .where(eq(books.id, bookId))
      .returning();

    res.status(200).json(MakeResponse(updatedBook[0], 'Buku berhasil diupdate'));
  } catch (error) {
    next(error);
  }
}

async function deleteBook(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = Number(req.params.id);

    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
    });

    if (!book) {
      throw ErrNotFound('Buku tidak ditemukan');
    }

    // Delete book
    await db.delete(books).where(eq(books.id, bookId));

    res.status(200).json(MakeResponse(null, 'Buku berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}

function parseBookSearchQuery(req: Request): SQL<unknown> | undefined {
  const query = req.query;
  if (Object.keys(query).length === 0) return undefined;

  // Top Priority search, will ignore other search
  // /api/books?search=value
  if (query.search) {
    return or(
      ilike(books.title, `%${query.search}%`),
      ilike(books.description, `%${query.search}%`),
    );
  }

  const conditions: any[] = [];
  // search by book id /api/books?bookId=value
  if (query.bookId) {
    conditions.push(eq(books.id, Number(query.bookId)));
  }

  // search by authorId /api/books?authorId=value
  if (query.authorId) {
    conditions.push(eq(authors.id, Number(query.authorId)));
  }

  // search by book title /api/books?title=value
  if (query.title) {
    conditions.push(ilike(books.title, `%${query.title}%`));
  }

  // param queries above can be combined /api/books?bookId=1&authorId=1&title=value

  if (conditions.length === 1) {
    return conditions[0];
  }

  return and(...conditions);
}
