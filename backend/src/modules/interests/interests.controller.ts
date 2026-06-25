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
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { InterestsService } from './interests.service';
import {
  SelectInterestDto,
  UpdateInterestLevelDto,
  InterestTaskQueryDto,
  InterestGrowthQueryDto,
  InterestResponseDto,
  UserInterestResponseDto,
  InterestTaskResponseDto,
  InterestGrowthResponseDto,
  InterestMonthlySummaryDto,
} from './dto/interest.dto';

/**
 * 兴趣模块控制器
 *
 * 路由前缀: /interests
 * OpenAPI 标签: 兴趣管理
 */
@ApiTags('兴趣管理')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(
  InterestResponseDto,
  UserInterestResponseDto,
  InterestTaskResponseDto,
  InterestGrowthResponseDto,
  InterestMonthlySummaryDto,
)
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  // ══════════════════════════════════════════════
  //  兴趣列表
  // ══════════════════════════════════════════════

  /**
   * GET /interests
   *
   * 获取所有兴趣标签
   */
  @Get()
  @ApiOperation({
    summary: '兴趣列表',
    description: '获取系统预设的所有兴趣标签，按 sortOrder 排序。',
  })
  @ApiOkResponse({
    description: '兴趣列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(InterestResponseDto) },
        },
      },
    },
  })
  async findAll() {
    const interests = await this.interestsService.findAll();
    return { data: interests };
  }

  /**
   * GET /interests/:id
   *
   * 获取单个兴趣详情
   */
  @Get(':id')
  @ApiOperation({
    summary: '兴趣详情',
    description: '根据 UUID 获取单个兴趣的详细信息。',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '兴趣 UUID',
  })
  @ApiOkResponse({ description: '兴趣详情', type: InterestResponseDto })
  @ApiNotFoundResponse({ description: '兴趣不存在' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const interest = await this.interestsService.findById(id);
    return { data: interest };
  }

  // ══════════════════════════════════════════════
  //  用户兴趣选择
  // ══════════════════════════════════════════════

  /**
   * GET /interests/user/mine
   *
   * 获取我的兴趣
   */
  @Get('user/mine')
  @ApiOperation({
    summary: '我的兴趣',
    description: '获取当前用户已选择的兴趣列表，含熟练等级和成长数据。',
  })
  @ApiOkResponse({
    description: '用户兴趣列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(UserInterestResponseDto) },
        },
      },
    },
  })
  async findMyInterests() {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const interests = await this.interestsService.findUserInterests(userId);
    return { data: interests };
  }

  /**
   * POST /interests/user/select
   *
   * 选择兴趣（批量）
   */
  @Post('user/select')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '选择兴趣',
    description: '批量选择兴趣标签（最多 10 个）。已选择的兴趣会被忽略。',
  })
  @ApiBody({
    type: SelectInterestDto,
    description: '兴趣 ID 列表',
    required: true,
  })
  @ApiCreatedResponse({
    description: '选择成功，返回当前用户所有兴趣',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(UserInterestResponseDto) },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: '请至少选择一个兴趣 / 最多选择 10 个' })
  @ApiNotFoundResponse({ description: '部分兴趣不存在' })
  async selectInterests(@Body() dto: SelectInterestDto) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const interests = await this.interestsService.selectInterests(userId, dto);
    return { data: interests };
  }

  /**
   * DELETE /interests/user/:interestId
   *
   * 取消兴趣
   */
  @Delete('user/:interestId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '取消兴趣',
    description: '从用户的兴趣列表中移除指定兴趣。',
  })
  @ApiParam({
    name: 'interestId',
    required: true,
    type: String,
    description: '兴趣 UUID',
  })
  @ApiNoContentResponse({ description: '取消成功' })
  @ApiNotFoundResponse({ description: '未选择该兴趣' })
  async removeInterest(
    @Param('interestId', ParseUUIDPipe) interestId: string,
  ) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    await this.interestsService.removeInterest(userId, interestId);
  }

  /**
   * PUT /interests/user/:interestId/level
   *
   * 更新兴趣等级
   */
  @Put('user/:interestId/level')
  @ApiOperation({
    summary: '更新兴趣等级',
    description: '更新指定兴趣的熟练等级（beginner / intermediate / advanced）。',
  })
  @ApiParam({
    name: 'interestId',
    required: true,
    type: String,
    description: '兴趣 UUID',
  })
  @ApiBody({
    type: UpdateInterestLevelDto,
    description: '熟练等级',
    required: true,
  })
  @ApiOkResponse({
    description: '更新后的用户兴趣',
    type: UserInterestResponseDto,
  })
  @ApiNotFoundResponse({ description: '未选择该兴趣' })
  @ApiBadRequestResponse({ description: '等级值无效' })
  async updateLevel(
    @Param('interestId', ParseUUIDPipe) interestId: string,
    @Body() dto: UpdateInterestLevelDto,
  ) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const ui = await this.interestsService.updateLevel(userId, interestId, dto);
    return { data: ui };
  }

  // ══════════════════════════════════════════════
  //  兴趣任务推荐
  // ══════════════════════════════════════════════

  /**
   * GET /interests/:interestId/tasks
   *
   * 获取指定兴趣下的推荐任务
   */
  @Get(':interestId/tasks')
  @ApiOperation({
    summary: '兴趣任务推荐',
    description: '获取指定兴趣分类下的活动任务，支持按难度和时长筛选。已完成的会标记 isCompleted。',
  })
  @ApiParam({
    name: 'interestId',
    required: true,
    type: String,
    description: '兴趣 UUID',
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
    name: 'difficulty',
    required: false,
    type: Number,
    description: '难度 1-5',
    example: 1,
    schema: { minimum: 1, maximum: 5 },
  })
  @ApiQuery({
    name: 'durationMin',
    required: false,
    type: Number,
    description: '最大时长（分钟）',
    example: 30,
  })
  @ApiOkResponse({
    description: '任务推荐分页列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(InterestTaskResponseDto) },
        },
        total: { type: 'integer', example: 15 },
      },
    },
  })
  async recommendTasks(
    @Param('interestId', ParseUUIDPipe) interestId: string,
    @Query() query: InterestTaskQueryDto,
  ) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const result = await this.interestsService.recommendTasks(
      userId,
      interestId,
      query,
    );
    return { data: result.items, total: result.total };
  }

  /**
   * GET /interests/tasks/recommended
   *
   * 获取所有兴趣的推荐任务（首页）
   */
  @Get('tasks/recommended')
  @ApiOperation({
    summary: '推荐任务（首页）',
    description: '根据用户选择的兴趣，推荐所有兴趣下的任务。按评分和完成率排序。',
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
    name: 'difficulty',
    required: false,
    type: Number,
    description: '难度 1-5',
    example: 1,
    schema: { minimum: 1, maximum: 5 },
  })
  @ApiOkResponse({
    description: '推荐任务分页列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(InterestTaskResponseDto) },
        },
        total: { type: 'integer', example: 30 },
      },
    },
  })
  async recommendAllTasks(@Query() query: InterestTaskQueryDto) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const result = await this.interestsService.recommendAllTasks(
      userId,
      query,
    );
    return { data: result.items, total: result.total };
  }

  // ══════════════════════════════════════════════
  //  兴趣成长记录
  // ══════════════════════════════════════════════

  /**
   * GET /interests/growth/mine
   *
   * 获取我的兴趣成长记录
   */
  @Get('growth/mine')
  @ApiOperation({
    summary: '兴趣成长记录',
    description:
      '获取当前用户所有兴趣的成长数据，包括总活动数、总时长、连续天数、周/月活跃度等。按活动数降序排列。',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: '年份（默认当前年）',
    example: 2026,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: '月份 1-12',
    example: 6,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: '开始日期 YYYY-MM-DD',
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: '结束日期 YYYY-MM-DD',
    example: '2026-12-31',
  })
  @ApiOkResponse({
    description: '兴趣成长记录列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(InterestGrowthResponseDto) },
        },
      },
    },
  })
  async getGrowthRecords(@Query() query: InterestGrowthQueryDto) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const records = await this.interestsService.getGrowthRecords(
      userId,
      query,
    );
    return { data: records };
  }

  /**
   * GET /interests/growth/monthly-summary
   *
   * 月度兴趣活跃度汇总
   */
  @Get('growth/monthly-summary')
  @ApiOperation({
    summary: '月度兴趣汇总',
    description: '获取指定月份的活跃度汇总数据，包括总兴趣数、总活动数、总时长、排行等。',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: '年份（默认当前年）',
    example: 2026,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: '月份 1-12（默认当前月）',
    example: 6,
  })
  @ApiOkResponse({
    description: '月度汇总',
    type: InterestMonthlySummaryDto,
  })
  async getMonthlySummary(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const y = year ? parseInt(year, 10) : undefined;
    const m = month ? parseInt(month, 10) : undefined;
    const summary = await this.interestsService.getMonthlySummary(userId, y, m);
    return { data: summary };
  }
}
