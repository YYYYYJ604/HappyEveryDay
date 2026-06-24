# TypeORM Migration 方案

> 项目: Happy Every Day (天天开心)
> 数据库: PostgreSQL 15
> ORM: TypeORM v0.3.x
> NestJS 版本: v11

---

## 1. 安装依赖

```bash
npm install @nestjs/typeorm typeorm pg
```

> 当前 package.json 使用 module: nodenext，TypeORM v0.3.x 完全兼容。

---

## 2. Migration 目录结构

```
backend/
  src/database/
    migrations/
      0000-CreateExtensions.ts
      0001-CreateUsersTable.ts
      0002-CreateUserProfilesTable.ts
      0003-CreateDailyPlansTable.ts
      0004-CreateInterestsTable.ts
      0005-CreateUserInterestsTable.ts
      0006-CreateActivitiesTable.ts
      0007-CreateMoodLogsTable.ts
      0008-CreateJournalsTable.ts
      0009-CreateFavoritesTable.ts
      0010-CreateIndexesAndTriggers.ts
      0011-xxxx  (后续增量)
    data-source.ts
    database.module.ts
  ormconfig.ts
  .env
```

---

## 3. 命名规范

### 3.1 文件命名

[顺序号]-[Action][EntityName].ts

| 部分 | 规则 | 示例 |
|------|------|------|
| 顺序号 | 4位数字，全局递增 | 0001, 0002 |
| Action | Create / Alter / Drop / AddIndex | Create |
| EntityName | 帕斯卡命名 | UsersTable |

> 也可以使用时间戳格式（如 1740000000000），两种风格均可，保持一致即可。

### 3.2 类命名

```typescript
export class CreateUsersTable0001 implements MigrationInterface {
  name = 'CreateUsersTable0001';
}
```

### 3.3 表名约定

| 规则 | 说明 | 示例 |
|------|------|------|
| 全小写 + 下划线 | 与 DDL 一致 | daily_plans |
| 单数形式 | 推荐 | user, interest |
| 避免保留字 | 避开 SQL 关键字 | 不用 order, group |

---

## 4. 配置文件

### 4.1 data-source.ts

```typescript
import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
config();
export const options: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "happy_every_day",
  entities: ["dist/**/*.entity{.ts,.js}"],
  migrations: ["dist/database/migrations/*{.ts,.js}"],
  migrationsTableName: "migrations_typeorm",
};
const ds = new DataSource(options);
export default ds;
```

### 4.2 database.module.ts

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { options } from "./data-source";
@Module({
  imports: [TypeOrmModule.forRoot({ ...options, autoLoadEntities: true, migrationsRun: false })]
})
export class DatabaseModule {}
```

### 4.3 ormconfig.ts

```typescript
import { DataSource } from "typeorm";
import { options } from "./src/database/data-source";
export default new DataSource({
  ...options,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/database/migrations/*.ts"],
});
```

### 4.4 .env

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=happy_every_day
```

---

## 5. package.json 脚本配置

```json
"scripts": {
  "mg:create":  "typeorm migration:create src/database/migrations/$npm_config_name",
  "mg:gen":     "typeorm migration:generate -d ormconfig.ts -p src/database/migrations/$npm_config_name",
  "mg:run":     "typeorm migration:run -d ormconfig.ts",
  "mg:revert":  "typeorm migration:revert -d ormconfig.ts",
  "mg:show":    "typeorm migration:show -d ormconfig.ts"
}
```

使用: npm run mg:run   (短命名)

---

## 6. 初始化迁移模板

### 6.0 扩展: 0000-CreateExtensions.ts

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";
export class CreateExtensions0000 implements MigrationInterface {
  name = 'CreateExtensions0000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await q.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
  }
  async down(q: QueryRunner): Promise<void> {}
}
```

### 6.1 用户主表: 0001-CreateUsersTable.ts

```typescript
import { MigrationInterface, QueryRunner, Table } from "typeorm";
export class CreateUsersTable0001 implements MigrationInterface {
  name = 'CreateUsersTable0001';
  async up(q: QueryRunner): Promise<void> {
    await q.createTable(new Table({
      name: "users",
      columns: [
        { name: "id", type: "uuid", isPrimary: true, default: "gen_random_uuid()" },
        { name: "phone", type: "varchar", length: "20", isNullable: false },
        { name: "nickname", type: "varchar", length: "50", isNullable: false },
        { name: "password_hash", type: "varchar", length: "255", isNullable: false },
        { name: "role", type: "varchar", length: "20", default: ""user"" },
        { name: "is_active", type: "boolean", default: true },
        { name: "created_at", type: "timestamptz", default: "NOW()" },
        { name: "updated_at", type: "timestamptz", default: "NOW()" },
        { name: "deleted_at", type: "timestamptz", isNullable: true },
      ],
    }), true);
    await q.query(`CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.dropTable("users");
  }
}
```

> 完整字段见 database/init.sql，此处为骨架示例。

---

## 7. 执行与回滚方案

### 7.1 执行顺序

| 顺序 | 文件 | 说明 |
|------|------|------|
| 1 | 0000-CreateExtensions | uuid-ossp + pgcrypto |
| 2 | 0001-CreateUsersTable | 独立表 |
| 3 | 0002-CreateUserProfilesTable | 依赖 users |
| 4 | 0003-CreateDailyPlansTable | 依赖 users |
| 5 | 0004-CreateInterestsTable | 独立表 |
| 6 | 0005-CreateUserInterestsTable | 依赖 users + interests |
| 7 | 0006-CreateActivitiesTable | 依赖 interests |
| 8 | 0007-CreateMoodLogsTable | 依赖 users |
| 9 | 0008-CreateJournalsTable | 依赖 users |
| 10 | 0009-CreateFavoritesTable | 依赖 users |
| 11 | 0010-CreateIndexesAndTriggers | 收尾: 所有索引 + 触发器 |

### 7.2 首次执行

```bash
# 创建库并执行全部迁移
createdb -U postgres happy_every_day
npm run mg:run
```

### 7.3 回滚方案

| 操作 | 命令 | 风险 |
|------|------|------|
| 回滚最近一次 | npm run mg:revert | 低 |
| 回滚到指定版本 | 多次 mg:revert | 中 |
| 回滚全部 | 循环 mg:revert 或 psql -f init.sql | 高（数据丢失） |
| CI/CD 合并冲突 | 保持文件只增不删, 变更前 create 迁移 | - |

---

## 8. 最佳实践

1. 迁移文件只增不删，已提交到 Git 的禁止修改。
2. 生成增量迁移后用 `mg:gen`，手写数据迁移用 `mg:create`。
3. 生产环境设置 `migrationsRun: false`，由 CI/CD 手动控制。
4. 迁移中必须同时实现 up + down。
5. 外键约束和索引放在表迁移各自的 down 方法中清理。
6. 使用 `queryRunner.query()` 执行原生 SQL，而非 entityManager。

