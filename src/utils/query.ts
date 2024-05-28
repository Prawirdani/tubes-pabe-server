import { SQL, and, eq, ilike, or } from 'drizzle-orm';
import { authors, books } from '../db/schemas/books';
import { Request } from 'express';

export function parseBookSearchQuery(req: Request): SQL<unknown> | undefined {
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
