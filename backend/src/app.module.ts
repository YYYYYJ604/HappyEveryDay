import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './common/config';
import { DatabaseModule } from './common/database';
import { UsersModule } from './modules/users/users.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { DailyPlansModule } from './modules/daily-plans/daily-plans.module';

@Module({
  imports: [
    // 全局配置模块（必须在最前面加载）
    AppConfigModule,

    // 数据库连接（TypeORM）
    DatabaseModule,

    // 业务模块
    UsersModule,
    ActivitiesModule,
    DailyPlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

