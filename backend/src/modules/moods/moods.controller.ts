import {
  Controller,
  Get,
  Post,
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
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { MoodsService } from './moods.service';
import {
  MoodLevel,
  CreateMoodDto,
  MoodQueryDto,
  MonthStatQueryDto,
  MoodResponseDto,
  MonthStatDto,
} from './dto/mood.dto';

/**
 * 心情模块控制器
 *
 * 路由前缀: /moods
 * OpenAPI 标签: 心情记录
 */
@ApiTags('心情记录')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(MoodResponseDto, MonthStatDto)
@Controller('moods')
export class MoodsController {
  constructor(private readonly moodsService: MoodsService) {}

  // ══════════════════════════════════════════════
  //  记录心情
  // ══════════════════════════════════════════════

  /**
   * POST /moods
   *
   * 记录今日心情
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '记录心情',
    description:
      '记录今日心情。支持 4 个等级：低落(low)、一般(fair)、不错(good)、开心(happy)。' +
      '自动映射到数据库 mood_type，强度不传则按等级自动设置默认值。',
  })
  @ApiBody({
    type: CreateMoodDto,
    description: '心情记录信息',
    required: true,
  })
  @ApiCreatedResponse({
    description: '创建成功，返回心情记录',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(MoodResponseDto) },
      },
    },
  })
  @ApiBadRequestResponse({ description: '心情等级无效' })
  async create(@Body() dto: CreateMoodDto) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const mood = await this.moodsService.create(userId, dto);
    return { data: mood };
  }

  // ══════════════════════════════════════════════
  //  查询
  // ══════════════════════════════════════════════

  /**
   * GET /moods
   *
   * 心情历史（分页）
   */
  @Get()
  @ApiOperation({
    summary: '心情历史',
    description:
      '分页查询心情记录，支持按等级和日期范围筛选。' +
      '返回按日期倒序排列。',
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
    name: 'level',
    required: false,
    type: String,
    description: '按心情等级筛选',
    example: 'good',
    schema: { enum: ['low', 'fair', 'good', 'happy'] },
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
    description: '心情记录分页列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(MoodResponseDto) },
        },
        total: { type: 'integer', example: 42 },
      },
    },
  })
  async findHistory(@Query() query: MoodQueryDto) {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const result = await this.moodsService.findHistory(userId, query);
    return { data: result.items, total: result.total };
  }

  /**
   * GET /moods/latest
   *
   * 获取最新一条心情
   */
  @Get('latest')
  @ApiOperation({
    summary: '最新心情',
    description: '获取当前用户最新的一条心情记录。如果没有记录返回 null。',
  })
  @ApiOkResponse({
    description: '最新心情记录（可能为 null）',
    schema: {
      type: 'object',
      properties: {
        data: {
          oneOf: [
            { $ref: getSchemaPath(MoodResponseDto) },
            { type: 'null' },
          ],
        },
      },
    },
  })
  async findLatest() {
    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const mood = await this.moodsService.findLatest(userId);
    return { data: mood };
  }

  // ══════════════════════════════════════════════
  //  月度统计
  // ══════════════════════════════════════════════

  /**
   * GET /moods/stats/monthly
   *
   * 月度心情统计
   */
  @Get('stats/monthly')
  @ApiOperation({
    summary: '月度统计',
    description:
      '查询指定年月的情绪分布统计。返回总天数、平均等级、平均强度、' +
      '每日心情分布、整体分布、连续打卡天数。',
  })
  @ApiQuery({
    name: 'year',
    required: true,
    type: Number,
    description: '年份',
    example: 2026,
  })
  @ApiQuery({
    name: 'month',
    required: true,
    type: Number,
    description: '月份 1-12',
    example: 6,
  })
  @ApiOkResponse({
    description: '月度统计',
    type: MonthStatDto,
  })
  @ApiBadRequestResponse({ description: '参数格式错误' })
  async getMonthStats(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    // 校验
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return { data: null };
    }

    // TODO: 从 JWT 获取当前用户 ID
    const userId = 'current-user-id';
    const stats = await this.moodsService.getMonthStats(userId, { year: y, month: m });
    return { data: stats };
  }
}
