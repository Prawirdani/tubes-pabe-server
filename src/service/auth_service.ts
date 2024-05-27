import { eq, getTableColumns } from 'drizzle-orm';
import db from '../db/conn';
import { users } from '../db/schemas/users';
import { ErrConflict, ErrUnauthorized } from '../utils/error';
import { AuthLoginSchema, AuthRegisterSchema } from '../schemas/auth_schema';
import bcrypt from 'bcrypt';

const register = async (request: AuthRegisterSchema) => {
    // Check if user with the same email already exists
    const user = await db.query.users.findFirst({
        where: eq(users.email, request.email),
    });

    if (user) {
        throw ErrConflict('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);

    const { password, ...rest } = getTableColumns(users); // Omit password from returning query
    const newUser = await db
        .insert(users)
        .values({
            nama: request.nama,
            email: request.email,
            password: hashedPassword,
        })
        .returning({
            ...rest,
        });

    return newUser;
};

const login = async (request: AuthLoginSchema) => {
    const user = await db.query.users.findFirst({
        where: eq(users.email, request.email),
    });

    if (!user || !(await bcrypt.compare(request.password, user.password!))) {
        throw ErrUnauthorized('Periksa kembali email dan password Anda');
    }

    // TODO: Implement JWT token generation

    return 'TokenDummy';
};

const authService = {
    register,
    login,
};

export default authService;
