import { Router, NextFunction, Request, Response } from 'express';
import { BookCreateSchema, bookCreateSchema } from '../schemas/book_schema';
import { ErrBadRequest, ErrNotFound } from '../utils/error';
import { deleteImage, storeImage } from '../utils/image';
import { parseBookSearchQuery } from '../utils/query';
import { AuthAccessToken } from './middleware/authenticate';
import { validateRequest } from '../utils/validator';
import { authors, books } from '../db/schemas/books';
import { MakeResponse } from '../utils/response';
import { uploader } from './middleware/uploader';
import { eq } from 'drizzle-orm';
import path from 'path';
import db from '../db';

const booksRoute = Router();
booksRoute.get('/books', getBooks);
booksRoute.post('/books', AuthAccessToken, uploader.single('image'), createBook);
booksRoute.put('/books/:id', AuthAccessToken, uploader.single('image'), updateBook);
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
    const dataBody = req.body.data;
    if (!dataBody) {
      throw ErrBadRequest('data form is empty!');
    }
    const jsonData = JSON.parse(dataBody) as BookCreateSchema;
    validateRequest(bookCreateSchema, jsonData);

    // check if file image provided
    const reqFile = req.file;
    if (!reqFile) {
      throw ErrBadRequest('image is required!');
    }

    // Check if author exists
    const author = await db.query.authors.findFirst({
      where: eq(authors.id, jsonData.authorId),
    });

    if (!author) {
      throw ErrNotFound('Penulis tidak ditemukan');
    }

    var book;
    await db.transaction(async (tx) => {
      const fBuff = reqFile.buffer;
      const filename = `${Date.now() + path.extname(reqFile.originalname)}`;

      // Store data
      const newBook = await tx
        .insert(books)
        .values({
          title: jsonData.title,
          description: jsonData.description,
          price: jsonData.price,
          authorId: jsonData.authorId,
          image: filename,
        })
        .returning();

      // save image
      await storeImage(filename, fBuff).catch((err) => {
        tx.rollback();
        next(err);
      });

      book = newBook[0];
    });

    res.status(201).json(MakeResponse(book, 'Buku berhasil ditambahkan'));
  } catch (error) {
    next(error);
  }
}

async function updateBook(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = Number(req.params.id);

    const dataBody = req.body.data;
    if (!dataBody) {
      throw ErrBadRequest('data form is empty!');
    }
    const requestData = JSON.parse(dataBody) as BookCreateSchema;
    validateRequest(bookCreateSchema, requestData);

    // check book exists
    var book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
    });
    if (!book) {
      throw ErrNotFound('Buku tidak ditemukan');
    }

    // Check if author exists
    const author = await db.query.authors.findFirst({
      where: eq(authors.id, requestData.authorId),
    });
    if (!author) {
      throw ErrNotFound('Penulis tidak ditemukan');
    }

    // stored image file name;
    var image = book.image;
    await db.transaction(async (tx) => {
      var buff: Buffer | undefined = undefined;
      var oldImage = image;

      // check image update request
      if (req.file) {
        const file = req.file;
        buff = file.buffer;
        // replace image filename
        image = `${Date.now() + path.extname(file.originalname)}`;
      }

      // Update book
      const updatedAt = new Date();
      book = (
        await tx
          .update(books)
          .set({
            ...requestData,
            updatedAt,
            image,
          })
          .where(eq(books.id, bookId))
          .returning()
      )[0];

      // store the image if buffer not undefined then delete the old image.
      if (buff) {
        await storeImage(image, buff)
          .then(() => deleteImage(oldImage))
          .catch((err) => {
            tx.rollback();
            next(err);
          });
      }
    });

    res.status(200).json(MakeResponse(book, 'Buku berhasil diupdate'));
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
    await deleteImage(book.image);

    res.status(200).json(MakeResponse(null, 'Buku berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}
