### Toegas Besar Pengembangan Aplikasi Backend (Server Side/Backend).

#### Prerequisites
- [Node.js](https://github.com/nodejs/node)
- PostgreSQL

#### Running the server
1. Create an empty database in PostgreSQL.
2. Rename [.env.example](./.env.example) to `.env` and fill in the required configuration.
3. Install the dependencies.
```bash
    npm install
```
4. Run Database Migration.
```bash
    npm run migrate
```
5. Run the server.
```bash
    npm run dev
```
