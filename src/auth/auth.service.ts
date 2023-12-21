import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gender, User, UserRole } from 'src/entities';
import { Repository } from 'typeorm';
import { WalletService } from './../modules/wallet/wallet.service';
import {
  ChangePasswordDTO,
  GoogleLoginDTO,
  LoginAdminDto,
  LoginUserDto,
  RefreshTokenDto,
  RegisterAdminDTO,
  RegisterUserDTO,
  UpdatePasswordDTO,
} from './dto';

import { comparePassword, hashPassword } from 'src/utils/password';

import { faker, fakerVI } from '@faker-js/faker';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { OAuth2Client } from 'google-auth-library';
import { Redis } from 'ioredis';
import {
  Http,
  createBadRequset,
  createBadRequsetNoMess,
  createFORBIDDEN,
  createSuccessResponse,
  createTooManyRequest,
  createUnAuthorized,
} from 'src/common';
import { JWTService } from 'src/configs';
import { MailService } from 'src/core';
import { GOOGLE_CLIENT_ID } from 'src/environments';
import { random4DigitNumber } from 'src/utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly walletService: WalletService,
    private readonly jwtService: JWTService,
    private mailService: MailService,
    @InjectRedis() private readonly client: Redis
  ) {}

  //register
  async register(registerDTO: RegisterUserDTO): Promise<Http> {
    try {
      // const { password } = registerDTO;
      const emailIsExist = await this.userRepository.findOne({
        where: { email: registerDTO.email },
      });
      if (emailIsExist) return createBadRequsetNoMess('Email already exists!!');
      console.log('hihi');
      const password = await hashPassword(registerDTO.password);
      console.log('hihi2');
      if (!password) return createBadRequset('Password is not hash');

      const newUser = new User({
        ...registerDTO,
        password: password,
        isPassword: true,
      });
      const wallet = await this.walletService.createWallet();
      newUser.wallet = wallet.uuid;

      const response = await this.userRepository.save(newUser);

      if (!response) return createBadRequset('Register is');

      const access_token = await this.jwtService.signToken(
        {
          ...response,
          device_token: response.device_token,
          uuid: response.uuid,
          roles: response.roles,
        },
        'access'
      );

      const refresh_token = await this.jwtService.signToken(
        {
          ...response,
          device_token: response.device_token,
          uuid: response.uuid,
          roles: response.roles,
        },
        'refresh'
      );

      return createSuccessResponse(
        { access_token, refresh_token, isUpdate: response.isUpdate },
        'Regist is'
      );
    } catch (error) {
      console.log('Something wrong at register service: ' + error.message);
    }
  }

  async registerAdmin(registerDTO: RegisterAdminDTO): Promise<Http> {
    try {
      const emailIsExist = await this.userRepository.findOne({
        where: { email: registerDTO.email },
      });

      if (emailIsExist) return createBadRequsetNoMess('Email already exists!!');

      const password = await hashPassword(registerDTO.password);

      if (!password) return createBadRequset('Password is not hash');
      const newUser = new User({
        ...registerDTO,
        password,
        roles: UserRole.ADMIN,
        isPassword: true,
      });

      const response = await this.userRepository.save(newUser);

      if (!response) return createBadRequset('Register is');

      return createSuccessResponse(
        response.email + ' has been registered successfully',
        'Register is'
      );
    } catch (error) {
      console.log(
        'Something wrong at register admin service: ' + error.message
      );
    }
  }

  async login(loginUserDTO: LoginUserDto): Promise<Http> {
    const emailIsExist = await this.userRepository.findOne({
      where: { email: loginUserDTO.email },
    });

    if (!emailIsExist) return createBadRequsetNoMess('Email is not exist!!');
    const isMatch = await comparePassword(
      loginUserDTO.password,
      emailIsExist.password
    );
    if (!isMatch) return createBadRequsetNoMess('Wrong password!!');

    const device_token = loginUserDTO.device_token;

    await this.userRepository.update(
      { email: loginUserDTO.email },
      { device_token: device_token, isPassword: true }
    );

    const access_token = await this.jwtService.signToken(
      {
        ...emailIsExist,
        device_token: device_token,
        uuid: emailIsExist.uuid,
        roles: emailIsExist.roles,
      },
      'access'
    );

    const refresh_token = await this.jwtService.signToken(
      {
        ...emailIsExist,
        device_token: device_token,
        uuid: emailIsExist.uuid,
        roles: emailIsExist.roles,
      },
      'refresh'
    );

    return createSuccessResponse(
      { access_token, refresh_token, isUpdate: emailIsExist.isUpdate },
      'Login is'
    );
  }

  async loginAdmin(loginUserDTO: LoginAdminDto): Promise<any> {
    const emailIsExist = await this.userRepository.findOne({
      where: { email: loginUserDTO.email },
    });
    if (!emailIsExist) return createBadRequsetNoMess('Email is not exist!!');
    if (emailIsExist?.roles !== UserRole.ADMIN)
      return createFORBIDDEN('Email is not admin!!');

    const isMatch = await comparePassword(
      loginUserDTO.password,
      emailIsExist.password
    );
    if (!isMatch) return createBadRequsetNoMess('Wrong password!!');

    await this.userRepository.update(
      { email: loginUserDTO.email },
      { isPassword: true, status: true }
    );

    const access_token = await this.jwtService.signToken(
      {
        ...emailIsExist,

        uuid: emailIsExist.uuid,
        roles: emailIsExist.roles,
      },
      'access'
    );

    return createSuccessResponse({ access_token }, 'Login is');
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<Http> {
    try {
      const isValid = await this.jwtService.verifyToken(
        refreshTokenDto.refreshToken,
        'refresh'
      );

      if (!isValid) {
        return createUnAuthorized('Refresh token is not valid');
      }

      const user = await this.userRepository.findOne({
        where: {
          uuid: isValid.uuid,
        },
      });

      if (!user) {
        return createBadRequset('User does not exist, so cannot refresh');
      }

      const access_token = await this.jwtService.signToken(
        {
          ...user,
          uuid: user.uuid,
          roles: user.roles,
        },
        'access'
      );

      const refresh_token = await this.jwtService.signToken(
        {
          ...user,
          uuid: user.uuid,
          roles: user.roles,
        },
        'refresh'
      );

      return createSuccessResponse(
        {
          access_token: access_token,
          refresh_token: refresh_token,
        },
        'Relogin successful'
      );
    } catch (error) {
      return createUnAuthorized('An error occurred while refreshing token');
    }
  }

  async crateDummyUser(): Promise<Http> {
    try {
      const users = [];
      for (let i = 0; i < 10; i++) {
        const wallet = await this.walletService.createWallet();
        const uri = faker.image.url({
          height: 250,
          width: 342,
        });
        const user = new User({
          email: fakerVI.internet.email(),
          password: await hashPassword('123456'),
          image_url: uri,
          public_id: uri,
          roles: UserRole.USER,
          fullname: fakerVI.person.fullName(),
          phone: fakerVI.phone.number('+84#########'),
          isPassword: true,
          isUpdate: true,
          status: false,
        });
        user.wallet = wallet.uuid;

        users.push(user);
      }
      const reponse = await this.userRepository.save(users);
      return createSuccessResponse(reponse.length, 'Create dummy user is');
    } catch (error) {
      console.log('Something wrong at create dummy user service: ' + error);
    }
  }

  async updatePassword(updatePasswordDTO: UpdatePasswordDTO): Promise<Http> {
    try {
      const { email, password } = updatePasswordDTO;
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) return createBadRequsetNoMess('Not found email');

      const newPassword = await hashPassword(password);
      if (!newPassword) return createBadRequsetNoMess('Not found email');

      const response = await this.userRepository.update(
        { email: email },
        { password: newPassword, isPassword: true }
      );
      if (!response) return createBadRequsetNoMess('Not found email');

      return createSuccessResponse(response, 'Update password is');
    } catch (error) {
      console.log(`Something wrong at update password service: ${error}`);
      throw error;
    }
  }

  async changePassword(ChangePasswordDTO: ChangePasswordDTO): Promise<Http> {
    try {
      const { email, oldPassword, newPassword } = ChangePasswordDTO;
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) return createBadRequsetNoMess('Not found email');
      const isMatch = await comparePassword(oldPassword, user.password);

      if (!isMatch) return createBadRequsetNoMess('Old password is wrong');

      const hashNewPassword = await hashPassword(newPassword);

      if (!hashNewPassword)
        return createBadRequsetNoMess('Password is not hash');

      const response = await this.userRepository.update(
        { email: email },
        { password: hashNewPassword, isPassword: true }
      );
      if (!response) return createBadRequsetNoMess('Something wrong!!');

      return createSuccessResponse(response, 'Change password is');
    } catch (error) {
      console.log(`Something wrong at change password service: ${error}`);
    }
  }

  async googleLogin(googleLoginDTO: GoogleLoginDTO): Promise<Http> {
    const { idToken, device_token } = googleLoginDTO;

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);

    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const email = payload.email;

      let user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        const wallet = await this.walletService.createWallet();
        user = new User({
          email: email,
          image_url: payload.picture,
          fullname: payload.name,
          roles: UserRole.USER,
          isPassword: false,
          isUpdate: true,
          wallet: wallet.uuid,
        });
        await this.userRepository.update(
          { email: email },
          { device_token: device_token }
        );
        await this.userRepository.save(user);
      }

      await this.userRepository.update(
        { email: email },
        { device_token: device_token }
      );

      const access_token = await this.jwtService.signToken(
        { ...user },
        'access'
      );

      const refresh_token = await this.jwtService.signToken(
        { ...user },
        'refresh'
      );

      return createSuccessResponse(
        {
          access_token,
          refresh_token,
          isUpdatePassword: user.isPassword,
        },
        'Login is'
      );
    } catch (error) {
      throw new HttpException('Google login failed', HttpStatus.UNAUTHORIZED);
    }
  }

  async sendOTP(email: string): Promise<Http> {
    try {
      const cacheSendOTP = await this.client.get(email);
      if (cacheSendOTP)
        return createTooManyRequest(
          'OTP has been sent, please wait 60 seconds for the next send!!'
        );
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) return createBadRequsetNoMess('Account is not registered!!');
      const randomNumber = random4DigitNumber();
      const response = await this.mailService.sendOTP(email, randomNumber);
      if (!response) return createBadRequsetNoMess('Something wrong!!');
      await this.client.set(email, randomNumber, 'EX', 60);
      return createSuccessResponse(response, 'Send OTP is');
    } catch (error) {
      console.log('Something wrong at send OTP service: ' + error);
      throw error;
    }
  }

  async verifyOTP(email: string, otp: number): Promise<Http> {
    try {
      const cacheSendOTP = await this.client.get(email);
      if (!cacheSendOTP) return createBadRequsetNoMess('OTP is expired!!');
      if (Number(cacheSendOTP) !== otp)
        return createBadRequsetNoMess('OTP is wrong!!');
      await this.client.del(email);
      return createSuccessResponse('OTP is verified', 'Verify OTP is');
    } catch (error) {
      console.log('Something wrong at verify OTP service: ' + error);
      throw error;
    }
  }

  async handleVerifyToken(token: string) {
    try {
      const payload = this.jwtService.verifyToken(token, 'access');
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  async handleOnline(user_uuid: string) {
    await this.userRepository.update({ uuid: user_uuid }, { status: true });
  }

  async handleOffline(user_uuid: string) {
    console.log('hear');
    await this.userRepository.update({ uuid: user_uuid }, { status: false });
  }

  async checkUserStatus(user_uuid: string) {
    const user = await this.userRepository.findOne({
      where: { uuid: user_uuid },
    });
    if (!user) return createBadRequsetNoMess('User is not exist!!');
    console.log(user.isBanned);
    if (user.isBanned) {
      console.log('hihi');
      return await this.unBanned(user_uuid);
    } else {
      return await this.banned(user_uuid);
    }
  }

  async banned(user_uuid: string): Promise<Http> {
    try {
      const response = await this.userRepository.update(
        { uuid: user_uuid },
        { isBanned: true }
      );
      if (!response) return createBadRequsetNoMess('Something wrong!!');
      return createSuccessResponse(response, 'Banned is');
    } catch (error) {
      console.log('Something wrong at banned service: ' + error);
      throw error;
    }
  }

  async unBanned(user_uuid: string): Promise<Http> {
    try {
      const response = await this.userRepository.update(
        { uuid: user_uuid },
        { isBanned: false }
      );
      if (!response) return createBadRequsetNoMess('Something wrong!!');
      return createSuccessResponse(response, 'Unbanned is');
    } catch (error) {
      console.log('Something wrong at unbanned service: ' + error);
      return createBadRequsetNoMess('Something wrong!!');
    }
  }
}
