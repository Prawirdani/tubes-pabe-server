import { eq, getTableColumns } from 'drizzle-orm';
import db from '../db';
import { users } from '../db/schemas/users';
import { ErrConflict, ErrUnauthorized } from '../utils/error';
import { AuthLoginSchema, AuthRegisterSchema } from '../schemas/auth_schema';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

const register = async (request: AuthRegisterSchema) => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, request.email),
  });

  if (user) {
    throw ErrConflict('Email yang sama sudah terdaftar!');
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

  const { password, createdAt, updatedAt, ...payload } = user; // Omit password, createdAt and updatedAt from user object
  const accessToken = generateToken(payload);
  const refreshToken = generateToken({ id: payload.id }, 'refresh');

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (userId: number) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw ErrUnauthorized('User not found');
  }

  const { password, createdAt, updatedAt, ...payload } = user; // Omit password, createdAt and updatedAt from user object
  const accessToken = generateToken(payload);
  const refreshToken = generateToken({ id: payload.id }, 'refresh');

  return {
    accessToken,
    refreshToken,
  };
};

const authService = {
  register,
  login,
  refreshToken,
};

export default authService;
