import redis from '@umami/redis-client';
import debug from 'debug';
import { setAuthKey } from 'lib/auth';
import { secret, uuid } from 'lib/crypto';
import { useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, UTDUser, User } from 'lib/types';
import { NextApiResponse } from 'next';
import {
  checkPassword,
  createSecureToken,
  forbidden,
  methodNotAllowed,
  ok,
  unauthorized,
} from 'next-basics';
import { createUser, getUserByUsername } from 'queries';
import * as yup from 'yup';
import { ROLES } from 'lib/constants';

const log = debug('umami:auth');

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UTDLoginResponse {
  success: boolean;
  message: string;
  token: string;
  error: any;
  data: UTDUser;
}

const schema = {
  POST: yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
  }),
};

async function UTDLogin(email, password): Promise<UTDLoginResponse> {
  const payload = {
    email,
    password,
    keepMeSignedIn: true,
    isOAuth: false,
  };

  const data = await fetch('https://www.uptodateconnect.com/api/v1/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then(res => {
      if (res.ok) return res.json();
    })
    .catch(err => ({ success: false, error: err }));

  return data;
}

export default async (
  req: NextApiRequestQueryBody<any, LoginRequestBody>,
  res: NextApiResponse<LoginResponse>,
) => {
  if (process.env.DISABLE_LOGIN) {
    return forbidden(res);
  }

  await useValidate(schema, req, res);

  if (req.method === 'POST') {
    const { username, password } = req.body;

    const utdUser = await UTDLogin(username, password);

    if (!utdUser?.success) {
      return unauthorized(res, 'message.incorrect-username-password');
    }

    let user = await getUserByUsername(username, { includePassword: true });

    if (!user) {
      const allowedRoles = [2, 11];
      const newUserRole = allowedRoles.includes(utdUser.data.roleId) ? ROLES.admin : ROLES.user;

      await createUser({
        id: uuid(),
        username,
        password: utdUser.data.password,
        role: newUserRole,
      });

      user = await getUserByUsername(username, { includePassword: true });
    }

    if (user && checkPassword(password, user.password)) {
      if (redis) {
        const token = await setAuthKey(user);

        return ok(res, { token, user });
      }

      const token = createSecureToken({ userId: user.id }, secret());
      const { id, username, role, createdAt } = user;

      return ok(res, {
        token,
        user: { id, username, role, createdAt, isAdmin: role === ROLES.admin },
      });
    }

    log('Login failed:', { username, user });

    return unauthorized(res, 'message.incorrect-username-password');
  }

  return methodNotAllowed(res);
};
