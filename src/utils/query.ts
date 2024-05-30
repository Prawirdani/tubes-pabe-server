import { SQL, and, eq, ilike, or } from 'drizzle-orm';
import { authors, books } from '../db/schemas/books';
import { Request } from 'express';

export function parseBookSearchQuery(req: Request): SQL<unknown> | undefined {
  const query = req.query;
  if (Object.keys(query).length === 0) return undefined;

  /*
   * Top Priority search, search by title, description, author name.
   * it will ignore other queries if provided.
   * Endpoint: /api/books?search=value
   */
  if (query.search) {
    return or(
      ilike(books.title, `%${query.search}%`),
      ilike(books.description, `%${query.search}%`),
      ilike(authors.name, `%${query.search}%`),
    );
  }

  const conditions: any[] = [];

  /*
   * Search by book id.
   * Endpoint: /api/books?bookId=value
   */
  if (query.bookId) {
    conditions.push(eq(books.id, Number(query.bookId)));
  }

  /*
   * Search by Author name.
   * Endpoint: /api/books?author=value
   */
  if (query.author) {
    conditions.push(ilike(authors.name, `%${query.author}%`));
  }

  /*
   * Search by Book title.
   * Endpoint: /api/books?title=value
   */
  if (query.title) {
    conditions.push(ilike(books.title, `%${query.title}%`));
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return and(...conditions);
}
