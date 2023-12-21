import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/entities';

import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_SECRET,
} from 'src/environments';

export type JWTPayload = {
  [key: string]: any;
  uuid: string;
  roles: UserRole;
};

type Token = 'access' | 'refresh';

const common: Record<Token, Record<string, string>> = {
  access: {
    secret: ACCESS_TOKEN_SECRET,
    expiration: ACCESS_TOKEN_EXPIRATION_TIME,
  },
  refresh: {
    secret: REFRESH_TOKEN_SECRET,
    expiration: REFRESH_TOKEN_EXPIRATION_TIME,
  },
};

@Injectable()
export class JWTService {
  constructor(private jwtService: JwtService) {}

  signToken(payload: JWTPayload, type: Token): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const options = {
          expiresIn: common[type].expiration,
          secret: common[type].secret,
        };
        const token = this.jwtService.sign(payload, options);
        resolve(token);
      } catch (error: any) {
        reject(error);
      }
    });
  }

  verifyToken(token: string, type: Token): Promise<JWTPayload> {
    return new Promise((resolve, reject) => {
      const options = {
        expiresIn: common[type].expiration,
        secret: common[type].secret,
      };
      try {
        const payload = this.jwtService.verify(token, options);
        resolve(payload);
      } catch (error: any) {
        reject(error);
      }
    });
  }
}
