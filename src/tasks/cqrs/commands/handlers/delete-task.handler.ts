import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/tasks/domain/entities/task.entity';
import { NotFoundException } from '@nestjs/common';
import { DeleteTaskCommand } from '../delete-task.command';
import { CacheManagerService } from 'src/tasks/caching/cache-manager.service';

@CommandHandler(DeleteTaskCommand)
export class DeleteTaskHandler implements ICommandHandler<DeleteTaskCommand> {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly cacheManagerService: CacheManagerService,
  ) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    const id = command.id;

    const task = await this.taskRepository.findOneBy({ id });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.taskRepository.delete(id);

    await this.cacheManagerService.deleteTaskFromCache(id);

    await this.cacheManagerService.invalidateAllTasksCache();
  }
}
