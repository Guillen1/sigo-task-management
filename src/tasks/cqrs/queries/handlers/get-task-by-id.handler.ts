import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task as TaskEntity } from 'src/tasks/domain/entities/task.entity';

import { NotFoundException } from '@nestjs/common';
import { GetTaskByIdQuery } from '../get-task-by-id.query';
import { CacheManagerService } from 'src/tasks/caching/cache-manager.service';
import { Task } from 'src/tasks/domain/models/task.model';

@QueryHandler(GetTaskByIdQuery)
export class GetTaskByIdHandler implements IQueryHandler<GetTaskByIdQuery> {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    private readonly cacheManagerService: CacheManagerService,
  ) {}

  async execute(query: GetTaskByIdQuery): Promise<Task> {
    const { id } = query;
    let task = await this.cacheManagerService.getTaskFromCache(id);
    if (!task) {
      const taskEntity = await this.taskRepository.findOneBy({ id });
      if (!taskEntity) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      task = Task.fromEntity(taskEntity);
      await this.cacheManagerService.cacheTask(task);
    }

    return task;
  }
}
