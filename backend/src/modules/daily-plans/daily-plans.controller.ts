import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
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
import { DailyPlansService } from './daily-plans.service';
import {
  GeneratePlanDto,
  GeneratePlanResponseDto,
  PlanItemDto,
  TodayProgressDto,
  DailyPlanQueryDto,
} from './dto/daily-plan.dto';
import { DailyPlanEntity } from './entities/daily-plan.entity';

/**
 * 每日计划控制器
 *
 * 路由前缀: /daily-plans
 * OpenAPI 标签: 每日计划
 */
@ApiTags('每日计划')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(PlanItemDto, GeneratePlanResponseDto, TodayProgressDto)
@Controller('daily-plans')
export class DailyPlansController {
  constructor(private readonly dailyPlansService: DailyPlansService) {}

  // ══════════════════════════════════════════════
  //  生成计划
  // ══════════════════════════════════════════════

  /**
   * POST /daily-plans/generate
   *
   * 生成今日计划（3 个层级：5 分钟 / 30 分钟 / 2 小时）
   */
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '生成每日计划',
    description:
      '根据用户兴趣 + 当前天气 + 时间段，自动生成 3 个时长层级的计划（5 分钟 / 30 分钟 / 2 小时）。' +
      '同一用户同一天同一时段不会重复生成，除非传入 force=true。',
  })
  @ApiBody({
    type: GeneratePlanDto,
    description: '生成配置（可选目标日期和强制覆盖参数）',
    required: true,
  })
  @ApiCreatedResponse({
    description: '生成成功，返回 3 个计划项',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            plans: {
              type: 'array',
              items: { $ref: getSchemaPath(PlanItemDto) },
              description: '3 个时长的计划列表',
            },
          },
        },
      },
    },
  })
  async generate(@Body() dto: GeneratePlanDto) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const result = await this.dailyPlansService.generate(userId, dto);
    return { data: result };
  }

  // ══════════════════════════════════════════════
  //  查询
  // ══════════════════════════════════════════════

  /**
   * GET /daily-plans/today
   *
   * 获取今日已生成的计划
   */
  @Get('today')
  @ApiOperation({
    summary: '获取今日计划',
    description: '返回今日已生成的所有计划（按时长排序）。如果尚未生成返回空数组。',
  })
  @ApiOkResponse({
    description: '今日计划列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(PlanItemDto) },
          description: '今日计划列表，按 durationType 排序',
        },
      },
    },
  })
  async findToday() {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const plans = await this.dailyPlansService.findToday(userId);
    return { data: plans };
  }

  /**
   * GET /daily-plans/today/progress
   *
   * 获取今日计划进度统计
   */
  @Get('today/progress')
  @ApiOperation({
    summary: '获取今日计划进度',
    description: '返回今日计划的总数、已完成、已跳过、待完成数量统计。',
  })
  @ApiOkResponse({
    description: '今日进度统计',
    type: TodayProgressDto,
  })
  async todayProgress() {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const progress = await this.dailyPlansService.getTodayProgress(userId);
    return { data: progress };
  }

  /**
   * GET /daily-plans/:date
   *
   * 获取指定日期的计划
   */
  @Get(':date')
  @ApiOperation({
    summary: '获取指定日期的计划',
    description: '根据日期查询该天的所有计划。日期格式 YYYY-MM-DD。',
  })
  @ApiParam({
    name: 'date',
    required: true,
    type: String,
    description: '计划日期 YYYY-MM-DD',
    example: '2026-06-25',
  })
  @ApiBadRequestResponse({ description: '日期格式错误' })
  @ApiOkResponse({
    description: '指定日期的计划列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(PlanItemDto) },
        },
      },
    },
  })
  async findByDate(@Param('date') date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('日期格式错误，预期 YYYY-MM-DD');
    }
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const plans = await this.dailyPlansService.findByDate(userId, date);
    return { data: plans };
  }

  /**
   * GET /daily-plans/history
   *
   * 历史计划（分页）
   */
  @Get('history')
  @ApiOperation({
    summary: '历史计划',
    description: '分页查询历史计划，支持按状态和日期范围筛选。',
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
    description: '按状态筛选',
    example: 'completed',
    schema: { enum: ['pending', 'completed', 'skipped'] },
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: '开始日期 YYYY-MM-DD',
    example: '2026-06-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: '结束日期 YYYY-MM-DD',
    example: '2026-06-30',
  })
  @ApiOkResponse({
    description: '历史计划分页列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(PlanItemDto) },
        },
        total: { type: 'integer', example: 42 },
      },
    },
  })
  async findHistory(@Query() query: DailyPlanQueryDto) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const result = await this.dailyPlansService.findHistory(userId, query);
    return { data: result.items, total: result.total };
  }

  // ══════════════════════════════════════════════
  //  状态变更
  // ══════════════════════════════════════════════

  /**
   * PUT /daily-plans/:id/complete
   *
   * 标记完成
   */
  @Put(':id/complete')
  @ApiOperation({
    summary: '标记完成',
    description: '将指定计划标记为已完成，记录完成时间。',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '计划 UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiOkResponse({
    description: '更新后的计划',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(PlanItemDto) },
      },
    },
  })
  @ApiNotFoundResponse({ description: '计划不存在' })
  @ApiConflictResponse({ description: '该计划已完成' })
  @ApiBadRequestResponse({ description: 'UUID 格式错误' })
  async complete(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const plan = await this.dailyPlansService.complete(userId, id);
    return { data: plan };
  }

  /**
   * PUT /daily-plans/:id/skip
   *
   * 标记跳过
   */
  @Put(':id/skip')
  @ApiOperation({
    summary: '标记跳过',
    description: '将指定计划标记为跳过。已完成计划不可跳过。',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '计划 UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiOkResponse({
    description: '更新后的计划',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(PlanItemDto) },
      },
    },
  })
  @ApiNotFoundResponse({ description: '计划不存在' })
  @ApiConflictResponse({ description: '已完成计划不可跳过' })
  @ApiBadRequestResponse({ description: 'UUID 格式错误' })
  async skip(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const plan = await this.dailyPlansService.skip(userId, id);
    return { data: plan };
  }
}
