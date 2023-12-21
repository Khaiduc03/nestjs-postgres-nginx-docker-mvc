import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Render,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { Http, createBadRequset } from 'src/common';
import { AuthGuard, RolesGuard } from 'src/core';
import { AuthService } from './auth.service';
import {
  BannedUserDTO,
  ChangePasswordDTO,
  GoogleLoginDTO,
  LoginAdminDto,
  LoginUserDto,
  RefreshTokenDto,
  RegisterAdminDTO,
  RegisterUserDTO,
  SendOTPDTO,
  UpdatePasswordDTO,
  VerifyOTPDTO,
} from './dto';
import { API_URL, BASE_URL } from 'src/environments';
import { Request, Response } from 'express';
import { Roles } from 'src/core/guards/roles.decorator';
import { UserRole } from 'src/entities';
import { isUUID } from 'class-validator';
console.log(BASE_URL);
@Controller(`${API_URL}/auth`)
export class AuthController {
  constructor(private authService: AuthService) {}

  // @Post('admin')
  // async loginAdmin(
  //   @Body() loginAdminDTO: LoginAdminDto,
  //   @Req() req: Request,
  //   @Res() res: Response
  // ) {
  //   const result = await this.authService.loginAdmin(loginAdminDTO);
  //   if (result?.data?.access_token) {
  //     req.session['token'] = result?.data?.access_token;

  //     console.log('GO TO HOME');
  //     res.redirect(`${BASE_URL}/home`);
  //   } else {
  //     console.log('TURN BACK LOGIN');
  //     res.redirect(`${BASE_URL}/login`);
  //   }
  //   //return res.status(200).json(result);
  // }

  @Post('admin')
  async loginAdmin(
    @Body() loginDTO: LoginAdminDto,
    @Req() req: Request
  ): Promise<Http> {
    console.log('hi');
    const result = await this.authService.loginAdmin(loginDTO);
    if (result?.data?.access_token) {
      req.session['token'] = result?.data?.access_token;
    } else {
    }
    return result;
  }

  @Post('register')
  async register(@Body() registerDTO: RegisterUserDTO): Promise<Http> {
    return await this.authService.register(registerDTO);
  }

  @Post('login')
  async login(@Body() loginDTO: LoginUserDto): Promise<Http> {
    return await this.authService.login(loginDTO);
  }

  @Post('admin-register')
  async registerAdmin(
    @Body() registerDTO: RegisterAdminDTO,
    @Res() res: Response
  ): Promise<any> {
    return res
      .status(200)
      .json(await this.authService.registerAdmin(registerDTO));
  }

  @Post('refresh-token')
  async refreshToken(@Body() RefreshTokenDto: RefreshTokenDto): Promise<Http> {
    return await this.authService.refreshToken(RefreshTokenDto);
  }

  @Post('google-login')
  async googleLogin(@Body() googleLoginDTO: GoogleLoginDTO): Promise<Http> {
    return this.authService.googleLogin(googleLoginDTO);
  }

  @Put('change-password')
  async changePassword(
    @Body() changePasswordDTO: ChangePasswordDTO
  ): Promise<Http> {
    return await this.authService.changePassword(changePasswordDTO);
  }

  @Put('update-password')
  async updatePassword(@Body() updatePasswordDTO: UpdatePasswordDTO) {
    return await this.authService.updatePassword(updatePasswordDTO);
  }

  @Get('dummy-user')
  async dummyUser(): Promise<Http> {
    return await this.authService.crateDummyUser();
  }

  @Post('send-otp')
  async sendOTP(@Body() sendOTP: SendOTPDTO): Promise<Http> {
    return await this.authService.sendOTP(sendOTP.email);
  }

  @Post('verify-otp')
  async verifyOTP(@Body() verifyOTPDTO: VerifyOTPDTO): Promise<any> {
    const { email, otp } = verifyOTPDTO;
    return await this.authService.verifyOTP(email, Number(otp));
  }

  @Post('banned')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  async banned(@Body() bannedUserDTO: BannedUserDTO): Promise<Http> {
    console.log(isUUID(bannedUserDTO.user_uuid));
    if (!isUUID(bannedUserDTO.user_uuid)) {
      return createBadRequset('User uuid is not valid');
    }

    return await this.authService.banned(bannedUserDTO.user_uuid);
  }

  @Post('un-banned')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async unBanned(@Body() bannedUserDTO: BannedUserDTO): Promise<Http> {
    console.log('hihi')
    if (!isUUID(bannedUserDTO.user_uuid)) {
      return createBadRequset('User uuid is not valid');
    }

    return await this.authService.checkUserStatus(bannedUserDTO.user_uuid);
  }
}
