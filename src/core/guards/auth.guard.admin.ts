import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Next,
  UnauthorizedException,
} from '@nestjs/common';
import { request } from 'express';
import { JWTService } from 'src/configs';
import { BASE_URL } from 'src/environments';
console.log(BASE_URL);
@Injectable()
export class AuthGuardAmin implements CanActivate {
  constructor(private readonly jwtService: JWTService) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const next = context.switchToHttp().getNext();

    try {
      const { session } = req;
      const url = req.originalUrl.toLowerCase();
      if (!session) {
        if (url.includes('login')) {
          console.log('have login in url sate1', url);
          Next();
        } else {
          console.log('Redict to login');
          res.redirect(`${BASE_URL}/login`);
        }
      } else {
        const { token } = session;
        if (!token) {
          if (url.includes('login')) {
            console.log('have login in url sate2', url);
            Next();
          } else {
            console.log('Redict to login2');
            res.redirect(`${BASE_URL}/login`);
          }
        } else {
          const user = await this.jwtService
            .verifyToken(token, 'access')
            .catch((err) => {
              throw new UnauthorizedException(err);
            });

          console.log('hihi' + user);
          if (user) {
            if (user?.roles === 'admin') {
              request['user'] = user;
              return true;
            } else {
              res.redirect(`${BASE_URL}/login`);
            }
          } else {
            res.redirect(`${BASE_URL}/login`);
          }
        }
      }
    } catch {
      res.redirect('/login');
    }
  }
}

// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   Next,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { request } from 'express';
// import { JWTService } from 'src/configs';
// import { BASE_URL } from 'src/environments';
// console.log(BASE_URL);
// @Injectable()
// export class AuthGuardAmin implements CanActivate {
//   constructor(private readonly jwtService: JWTService) {}

//   async canActivate(context: ExecutionContext): Promise<any> {
//     const req = context.switchToHttp().getRequest();
//     const res = context.switchToHttp().getResponse();
//     const next = context.switchToHttp().getNext();

//     try {
//       const token = request.headers['authorization'];
//       console.log(token);
//       const url = req.originalUrl.toLowerCase();
//       if (!token) {
//         if (url.includes('login')) {
//           console.log('have login in url sate1', url);
//           Next();
//         } else {
//           console.log('Redict to login');
//           res.redirect(`${BASE_URL}/login`);
//         }
//       } else {
//         if (!token) {
//           if (url.includes('login')) {
//             console.log('have login in url sate2', url);
//             Next();
//           } else {
//             console.log('Redict to login2');
//             res.redirect(`${BASE_URL}/login`);
//           }
//         } else {
//           const user = await this.jwtService
//             .verifyToken(token, 'access')
//             .catch((err) => {
//               throw new UnauthorizedException(err);
//             });

//           console.log('hihi' + user);
//           if (user) {
//             if (user?.roles === 'admin') {
//               request['user'] = user;
//               return true;
//             } else {
//               res.redirect(`${BASE_URL}/login`);
//             }
//           } else {
//             res.redirect(`${BASE_URL}/login`);
//           }
//         }
//       }
//     } catch {
//       res.redirect('/login');
//     }
//   }
// }
