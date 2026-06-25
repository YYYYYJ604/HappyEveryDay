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
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { ActivityQueryDto, CheckinQueryDto, BookmarkQueryDto } from './dto/activity-query.dto';
import { CreateCheckinDto, BookmarkActivityDto } from './dto/checkin.dto';

/**
 * 活动控制器
 *
 * 路由前缀: /activities
 */
@ApiTags('兴趣活动')
@ApiBearerAuth('JWT-auth')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // ──────────────────────────────────────────────
  //  活动列表 & 搜索
  // ──────────────────────────────────────────────

  /**
   * GET /activities
   *
   * 分页查询活动列表（支持搜索、筛选、排序）
   */
  @Get()
  @ApiOperation({
    summary: '活动列表',
    description: '分页查询活动，支持按分类/关键词/难度筛选，可排序。',
  })
  @ApiOkResponse({ description: '活动列表 + 总数' })
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
    description: '根据 UUID 查询活动完整信息。',
  })
  @ApiOkResponse({ description: '活动详情' })
  @ApiNotFoundResponse({ description: '活动不存在' })
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
    description: '根据兴趣分类 ID 获取该分类下的活动列表。',
  })
  @ApiOkResponse({ description: '活动列表 + 总数' })
  async findByInterest(
    @Param('interestId', ParseUUIDPipe) interestId: string,
    @Query() query: ActivityQueryDto,
  ) {
    const result = await this.activitiesService.findByInterest(interestId, query);
    return { data: result.items, total: result.total };
  }

  // ──────────────────────────────────────────────
  //  活动打卡
  // ──────────────────────────────────────────────

  /**
   * POST /activities/:id/checkin
   *
   * 开始参与活动
   */
  @Post(':id/checkin')
  @ApiOperation({
    summary: '开始参与活动',
    description: '创建打卡记录，标记用户开始参与活动。',
  })
  @ApiCreatedResponse({ description: '打卡记录' })
  @ApiConflictResponse({ description: '已参与该活动' })
  @ApiNotFoundResponse({ description: '活动不存在' })
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
    description: '更新打卡状态、评分和反馈。',
  })
  @ApiBody({ type: CreateCheckinDto })
  @ApiOkResponse({ description: '更新后的打卡记录' })
  @ApiNotFoundResponse({ description: '未找到打卡记录' })
  @ApiConflictResponse({ description: '已完成打卡' })
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
    description: '查询当前用户的打卡记录列表。',
  })
  @ApiOkResponse({ description: '打卡记录列表 + 总数' })
  async myCheckins(@Query() query: CheckinQueryDto) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const result = await this.activitiesService.findUserCheckins(userId, query);
    return { data: result.items, total: result.total };
  }

  // ──────────────────────────────────────────────
  //  收藏管理
  // ──────────────────────────────────────────────

  /**
   * POST /activities/:id/bookmark
   *
   * 收藏活动
   */
  @Post(':id/bookmark')
  @ApiOperation({
    summary: '收藏活动',
    description: '将活动添加到用户的收藏列表。',
  })
  @ApiCreatedResponse({ description: '收藏记录' })
  @ApiConflictResponse({ description: '已收藏该活动' })
  @ApiNotFoundResponse({ description: '活动不存在' })
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
    description: '从用户的收藏列表中移除该活动。',
  })
  @ApiNoContentResponse({ description: '取消成功' })
  @ApiNotFoundResponse({ description: '未收藏该活动' })
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
    description: '查询当前用户收藏的活动列表。',
  })
  @ApiOkResponse({ description: '收藏列表 + 总数' })
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
    description: '检查当前用户是否已收藏该活动。',
  })
  @ApiOkResponse({ description: '收藏状态 { bookmarked: boolean }' })
  async bookmarkStatus(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const bookmarked = await this.activitiesService.isBookmarked(id, userId);
    return { data: { bookmarked } };
  }
}
