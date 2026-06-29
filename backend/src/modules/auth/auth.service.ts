import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../../common/mail/mail.service';

@Injectable()
export class AuthService {
  private codes = new Map<string, { code: string; expires: number }>();

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('邮箱已注册');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      nickname: dto.nickname,
      //phone: dto.email,  // 用邮箱作为 phone 占位
      passwordHash,
    });
    await this.userRepo.save(user);
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }
    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  async sendCode(email: string, type: string) {
    const code = this.mailService.generateCode();
    this.codes.set(`${email}:${type}`, { code, expires: Date.now() + 10 * 60 * 1000 });
    await this.mailService.sendVerificationCode(email, code);
    return { message: '验证码已发送到邮箱' };
  }

  async verifyCode(email: string, code: string) {
    const record = this.codes.get(`${email}:register`);
    const isSuccess = record !== undefined && record.code === code && Date.now() < record.expires;
    if (isSuccess) {
      this.codes.delete(`${email}:register`);
    }
    return { isSuccess };
  }

  private generateTokens(user: UserEntity) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '2h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    if (!accessToken || !refreshToken) {
      throw new Error('Token generation failed');
    }
    return {
      accessToken,
      refreshToken,
      expiresIn: 7200,
    };
  }
}