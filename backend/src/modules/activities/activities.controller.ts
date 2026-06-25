import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import {
  ActivityResponseDto,
  CheckinResponseDto,
  BookmarkResponseDto,
} from './dto/activity-response.dto';
import { ActivityQueryDto, CheckinQueryDto, BookmarkQueryDto } from './dto/activity-query.dto';
import { CreateCheckinDto, BookmarkActivityDto } from './dto/checkin.dto';

/**
 * 活动控制器
 *
 * 路由前缀: /activities
 * OpenAPI 标签: 兴趣活动
 */
@ApiTags('兴趣活动')
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({ description: '未登录或 Token 已过期' })
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // ══════════════════════════════════════════════
  //  活动列表 & 搜索
  // ══════════════════════════════════════════════

  /**
   * GET /activities
   *
   * 分页查询活动列表（支持搜索、筛选、排序）
   */
  @Get()
  @ApiOperation({
    summary: '活动列表（分页）',
    description:
      '分页查询兴趣活动，支持按兴趣分类、关键词、难度筛选，支持多字段排序。',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '页码（从 1 开始）',
    example: 1,
    schema: { default: 1, minimum: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '每页条数',
    example: 20,
    schema: { default: 20, minimum: 1, maximum: 100 },
  })
  @ApiQuery({
    name: 'interestId',
    required: false,
    type: String,
    description: '兴趣分类 UUID，筛选该分类下的活动',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
    description: '搜索关键词（模糊匹配标题）',
    example: '绘画',
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    type: Number,
    description: '难度等级（1-5）',
    example: 1,
    schema: { minimum: 1, maximum: 5 },
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: '排序字段',
    example: 'createdAt',
    schema: {
      default: 'createdAt',
      enum: [
        'createdAt',
        'difficulty',
        'durationMin',
        'participantCount',
        'completionCount',
        'avgRating',
      ],
    },
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: '排序方向',
    example: 'DESC',
    schema: { default: 'DESC', enum: ['ASC', 'DESC'] },
  })
  @ApiOkResponse({
    description: '活动分页列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ActivityResponseDto' },
        },
        total: { type: 'integer', example: 42 },
      },
    },
  })
  async findAll(@Query() query: ActivityQueryDto) {
    const result = await this.activitiesService.findAll(query);
    return { data: result.items, total: result.total };
  }

  /**
   * GET /activities/:id
   *
   * 查询活动详情
   */
  @Get(':id')
  @ApiOperation({
    summary: '活动详情',
    description: '根据 UUID 查询活动的完整信息。',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '活动 UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiOkResponse({
    description: '活动详情',
    type: ActivityResponseDto,
  })
  @ApiNotFoundResponse({ description: '活动不存在' })
  @ApiBadRequestResponse({ description: 'UUID 格式错误' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const activity = await this.activitiesService.findById(id);
    return { data: activity };
  }

  /**
   * GET /activities/interest/:interestId
   *
   * 按兴趣分类获取活动
   */
  @Get('interest/:interestId')
  @ApiOperation({
    summary: '按分类获取活动',
    description: '根据兴趣分类 ID 获取该分类下的活动列表，支持分页和排序。',
  })
  @ApiParam({
    name: 'interestId',
    required: true,
    type: String,
    description: '兴趣分类 UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiOkResponse({
    description: '活动分页列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ActivityResponseDto' },
        },
        total: { type: 'integer', example: 10 },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'UUID 格式错误' })
  async findByInterest(
    @Param('interestId', ParseUUIDPipe) interestId: string,
    @Query() query: ActivityQueryDto,
  ) {
    const result = await this.activitiesService.findByInterest(interestId, query);
    return { data: result.items, total: result.total };
  }

  // ══════════════════════════════════════════════
  //  活动打卡
  // ══════════════════════════════════════════════

  /**
   * POST /activities/:id/checkin
   *
   * 开始参与活动
   */
  @Post(':id/checkin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '开始参与活动',
    description:
      '创建打卡记录，标记用户开始参与活动。状态初始化为 in_progress。一个用户对一个活动只能有一条进行中的记录。',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '活动 UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiCreatedResponse({
    description: '创建成功，返回打卡记录',
    type: CheckinResponseDto,
  })
  @ApiConflictResponse({ description: '已参与该活动，请勿重复打卡' })
  @ApiNotFoundResponse({ description: '活动不存在' })
  @ApiBadRequestResponse({ description: 'UUID 格式错误' })
  async startCheckin(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const checkin = await this.activitiesService.startCheckin(id, userId);
    return { data: checkin };
  }

  /**
   * PUT /activities/:id/checkin
   *
   * 完成打卡
   */
  @Put(':id/checkin')
  @ApiOperation({
    summary: '完成打卡',
    description: '更新打卡状态（completed/abandoned）、评分（1-5）和反馈内容。',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '活动 UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiBody({
    type: CreateCheckinDto,
    description: '打卡完成信息',
    required: true,
  })
  @ApiOkResponse({
    description: '更新成功，返回打卡记录',
    type: CheckinResponseDto,
  })
  @ApiNotFoundResponse({ description: '未找到打卡记录，请先开始活动' })
  @ApiConflictResponse({ description: '该活动已完成打卡，不可重复完成' })
  @ApiBadRequestResponse({ description: '请求参数校验失败' })
  async completeCheckin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCheckinDto,
  ) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const checkin = await this.activitiesService.completeCheckin(id, userId, dto);
    return { data: checkin };
  }

  /**
   * GET /activities/checkins/mine
   *
   * 查询我的打卡记录
   */
  @Get('checkins/mine')
  @ApiOperation({
    summary: '我的打卡记录',
    description: '查询当前用户的所有打卡记录列表，支持按状态筛选和分页。',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '页码',
    example: 1,
    schema: { default: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '每页条数',
    example: 20,
    schema: { default: 20 },
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: '打卡状态筛选',
    example: 'completed',
    schema: { enum: ['in_progress', 'completed', 'abandoned'] },
  })
  @ApiOkResponse({
    description: '打卡记录分页列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CheckinResponseDto' },
        },
        total: { type: 'integer', example: 5 },
      },
    },
  })
  async myCheckins(@Query() query: CheckinQueryDto) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const result = await this.activitiesService.findUserCheckins(userId, query);
    return { data: result.items, total: result.total };
  }

  // ══════════════════════════════════════════════
  //  收藏管理
  // ══════════════════════════════════════════════

  /**
   * POST /activities/:id/bookmark
   *
   * 收藏活动
   */
  @Post(':id/bookmark')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '收藏活动',
    description: '将活动添加到用户的收藏列表。一个用户不能重复收藏同一活动。',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '活动 UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiBody({
    type: BookmarkActivityDto,
    description: '收藏备注（可选）',
    required: false,
  })
  @ApiCreatedResponse({
    description: '收藏成功',
    type: BookmarkResponseDto,
  })
  @ApiConflictResponse({ description: '已收藏该活动' })
  @ApiNotFoundResponse({ description: '活动不存在' })
  @ApiBadRequestResponse({ description: 'UUID 格式错误' })
  async bookmark(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto?: BookmarkActivityDto,
  ) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const bookmark = await this.activitiesService.bookmarkActivity(id, userId, dto);
    return { data: bookmark };
  }

  /**
   * DELETE /activities/:id/bookmark
   *
   * 取消收藏活动
   */
  @Delete(':id/bookmark')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '取消收藏',
    description: '从用户的收藏列表中移除指定活动。',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '活动 UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiNoContentResponse({
    description: '取消成功（无返回体）',
  })
  @ApiNotFoundResponse({ description: '未收藏该活动' })
  @ApiBadRequestResponse({ description: 'UUID 格式错误' })
  async unbookmark(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    await this.activitiesService.unbookmarkActivity(id, userId);
  }

  /**
   * GET /activities/bookmarks/mine
   *
   * 我的收藏列表
   */
  @Get('bookmarks/mine')
  @ApiOperation({
    summary: '我的收藏',
    description: '查询当前用户收藏的活动列表，支持分页。',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '页码',
    example: 1,
    schema: { default: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '每页条数',
    example: 20,
    schema: { default: 20 },
  })
  @ApiOkResponse({
    description: '收藏列表分页',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/BookmarkResponseDto' },
        },
        total: { type: 'integer', example: 3 },
      },
    },
  })
  async myBookmarks(@Query() query: BookmarkQueryDto) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const result = await this.activitiesService.findUserBookmarks(userId, query);
    return { data: result.items, total: result.total };
  }

  /**
   * GET /activities/:id/bookmark-status
   *
   * 检查是否已收藏
   */
  @Get(':id/bookmark-status')
  @ApiOperation({
    summary: '检查收藏状态',
    description: '检查当前用户是否已收藏指定活动。',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '活动 UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiOkResponse({
    description: '收藏状态',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            bookmarked: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'UUID 格式错误' })
  async bookmarkStatus(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const bookmarked = await this.activitiesService.isBookmarked(id, userId);
    return { data: { bookmarked } };
  }
}
