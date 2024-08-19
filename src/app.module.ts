import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './tasks/domain/entities/task.entity';
import { TasksModule } from './tasks/tasks.module';
import { HealthModule } from './health/health.module';
import { MainController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      synchronize: true,
      logging: true,
      entities: [Task],
    }),
    RedisModule.forRoot({
      type: 'single',
      options: {
        host: 'localhost',
        port: 6379,
      },
    }),
    TasksModule,
    HealthModule,
  ],
  controllers: [MainController],
})
export class AppModule {}
