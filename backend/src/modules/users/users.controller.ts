import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserInterestsDto, InterestQueryDto } from './dto/interest-query.dto';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * 用户控制器
 *
 * 路由前缀: /users
 */
@ApiTags('用户管理')
@ApiBearerAuth('JWT-auth')
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
  @ApiOperation({
    summary: '查询用户详情',
    description: '根据 UUID 查询用户完整信息，包含个人配置和兴趣标签。',
  })
  @ApiOkResponse({
    description: '用户详情',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: '用户不存在' })
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
  @ApiOperation({
    summary: '分页查询用户列表',
    description: '支持关键词搜索、角色筛选、分页。',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页条数', example: 20 })
  @ApiQuery({ name: 'keyword', required: false, type: String, description: '搜索关键词（昵称/手机号）' })
  @ApiQuery({ name: 'role', required: false, type: String, description: '角色筛选' })
  @ApiOkResponse({ description: '用户列表 + 总数' })
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
  @ApiOperation({
    summary: '修改用户资料',
    description: '同时更新 users 表和 user_profiles 表。只传需要修改的字段，未传字段保持不变。',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ description: '更新后的用户详情', type: UserResponseDto })
  @ApiNotFoundResponse({ description: '用户不存在' })
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
  @ApiOperation({
    summary: '获取可用兴趣标签',
    description: '返回系统维护的所有兴趣标签列表，支持按分类和关键词筛选。',
  })
  @ApiOkResponse({ description: '兴趣标签列表' })
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
  @ApiOperation({
    summary: '获取用户已关联的兴趣',
    description: '返回指定用户已选择的兴趣标签及熟练等级。',
  })
  @ApiOkResponse({ description: '用户兴趣列表' })
  @ApiNotFoundResponse({ description: '用户不存在' })
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
  @ApiOperation({
    summary: '全量替换用户兴趣标签',
    description: '在事务中删除旧关联并创建新关联。传入的列表将完全替换用户当前的所有兴趣。',
  })
  @ApiBody({ type: UpdateUserInterestsDto })
  @ApiOkResponse({ description: '更新后的用户兴趣列表' })
  @ApiNotFoundResponse({ description: '用户或兴趣标签不存在' })
  async updateUserInterests(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserInterestsDto,
  ) {
    const interests = await this.usersService.updateUserInterests(id, dto);
    return { data: interests };
  }
}
