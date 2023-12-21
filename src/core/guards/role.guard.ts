import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from 'src/entities';
import { ROLES_KEY } from './roles.decorator';
import { Request } from 'express';
import { JWTService } from 'src/configs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JWTService
  ) {}

  async canActivate(context: ExecutionContext){
    try {
      console.log('hi')
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()]
      );

      if (!requiredRoles) {
        return true;
      }
      console.log('hi2')

      const response = context.switchToHttp().getResponse();
      const request = context.switchToHttp().getRequest();
      //how to take user from request

      const user = await this.validateRequest(request, response);
      console.log('hi3')
      const checkRole = requiredRoles.some((role) => user.roles?.includes(role));
     
      if (!checkRole)
        throw new UnauthorizedException("you don't have enough access rights");
        console.log('hi4')
      return true;
    } catch (error) {}
  }

  private async validateRequest(
    request: Request,
    response: Response
  ): Promise<any> {
    try {
      const token = request.headers['authorization'].split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Unauthorized');
      }

      const user = await this.jwtService.verifyToken(token, 'access');

      if (!user) {
        throw new UnauthorizedException('Unauthorized');
      }

      request['user'] = user;

      return user;
    } catch (error) {
      response;
    }
  }
}

// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
//   HttpStatus,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { User, UserRole } from 'src/entities';
// import { ROLES_KEY } from './roles.decorator';
// import { Request } from 'express';
// import { JWTService } from 'src/configs';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     private readonly jwtService: JWTService
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     try {
//       console.log('hihi');
//       const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
//         ROLES_KEY,
//         [context.getHandler(), context.getClass()]
//       );
//       if (!requiredRoles) {
//         return true;
//       }

//       const response = context.switchToHttp().getResponse();
//       const request = context.switchToHttp().getRequest();
//       //how to take user from request

//       const user = await this.validateRequest(request, response);

//       const checkRole = requiredRoles.some((role) => user.role?.includes(role));
//       if (!checkRole)
//         throw new UnauthorizedException("you don't have enough access rights");

//       return;
//     } catch (error) {}
//   }

//   private async validateRequest(
//     request: Request,
//     response: Response
//   ): Promise<any> {
//     try {
//       let token = request.headers['authorization'].split(' ')[1];
//       if (!token) {
//         token = request.session['token'];
//       }

//       const user = await this.jwtService.verifyToken(token, 'access');

//       if (!user) {
//         throw new UnauthorizedException('Unauthorized');
//       }

//       request['user'] = user;

//       return user;
//     } catch (error) {
//       response;
//     }
//   }
// }
