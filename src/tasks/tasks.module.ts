import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheManagerService } from './caching/cache-manager.service';
import { CreateTaskHandler } from './cqrs/commands/handlers/create-task.handler';
import { DeleteTaskHandler } from './cqrs/commands/handlers/delete-task.handler';
import { UpdateTaskHandler } from './cqrs/commands/handlers/update-task.handler';
import { Task } from './domain/entities/task.entity';
import { GetTaskByIdHandler } from './cqrs/queries/handlers/get-task-by-id.handler';
import { GetTaskHandler } from './cqrs/queries/handlers/get-task.handler';
import { TasksController } from './presentation/tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), CqrsModule],
  controllers: [TasksController],
  providers: [
    CreateTaskHandler,
    UpdateTaskHandler,
    GetTaskByIdHandler,
    GetTaskHandler,
    DeleteTaskHandler,
    CacheManagerService,
  ],
})
export class TasksModule {}
