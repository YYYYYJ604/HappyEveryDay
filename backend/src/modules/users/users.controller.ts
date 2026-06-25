import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserInterestsDto, InterestQueryDto } from './dto/interest-query.dto';

/**
 * 用户控制器
 *
 * 路由前缀: /users
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ──────────────────────────────────────────────
  //  用户信息查询
  // ──────────────────────────────────────────────

  /**
   * GET /users/:id
   *
   * 查询用户详情（含 profile 和 interests）
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    return { data: user };
  }

  /**
   * GET /users
   *
   * 分页查询用户列表
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('role') role?: string,
  ) {
    const result = await this.usersService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      keyword,
      role,
    });
    return { data: result.items, total: result.total };
  }

  // ──────────────────────────────────────────────
  //  修改资料
  // ──────────────────────────────────────────────

  /**
   * PUT /users/:id/profile
   *
   * 修改用户资料（支持 users + user_profiles 混写）
   */
  @Put(':id/profile')
  async updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(id, dto);
    return { data: user };
  }

  // ──────────────────────────────────────────────
  //  兴趣标签管理
  // ──────────────────────────────────────────────

  /**
   * GET /users/interests
   *
   * 获取所有可用的兴趣标签
   */
  @Get('interests')
  async listInterests(@Query() query?: InterestQueryDto) {
    const interests = await this.usersService.findAllInterests(query);
    return { data: interests };
  }

  /**
   * GET /users/:id/interests
   *
   * 获取指定用户已关联的兴趣标签
   */
  @Get(':id/interests')
  async getUserInterests(@Param('id', ParseUUIDPipe) id: string) {
    const interests = await this.usersService.findUserInterests(id);
    return { data: interests };
  }

  /**
   * PUT /users/:id/interests
   *
   * 全量替换用户的兴趣标签
   */
  @Put(':id/interests')
  @HttpCode(HttpStatus.OK)
  async updateUserInterests(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserInterestsDto,
  ) {
    const interests = await this.usersService.updateUserInterests(id, dto);
    return { data: interests };
  }
}
