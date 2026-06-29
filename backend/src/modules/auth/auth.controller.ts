import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiConflictResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiOkResponse({ description: '注册成功，返回 Token' })
  @ApiConflictResponse({ description: '邮箱已注册' })
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiOkResponse({ description: '登录成功，返回 Token' })
  @ApiUnauthorizedResponse({ description: '邮箱或密码错误' })
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新 Token' })
  @ApiOkResponse({ description: '刷新成功，返回新 Token' })
  @ApiUnauthorizedResponse({ description: '无效的刷新令牌' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return { data: await this.authService.refreshToken(refreshToken) };
  }

  @Post('code/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送邮箱验证码' })
  @ApiOkResponse({ description: '发送成功' })
  async sendCode(@Body() body: { email: string; type: string }) {
    return { data: await this.authService.sendCode(body.email, body.type) };
  }

  @Post('code/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证邮箱验证码' })
  @ApiOkResponse({ description: '验证成功' })
  async verifyCode(@Body() body: { email: string; code: string }) {
    return { data: await this.authService.verifyCode(body.email, body.code) };
  }
}