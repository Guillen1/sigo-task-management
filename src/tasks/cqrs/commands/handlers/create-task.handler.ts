import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheManagerService } from 'src/tasks/caching/cache-manager.service';
import { Task as TaskEntity} from 'src/tasks/domain/entities/task.entity';
import { Task, TaskStatus } from 'src/tasks/domain/models/task.model';
import { Repository } from 'typeorm';
import { CreateTaskCommand } from '../create-task.command';

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
    constructor(
        @InjectRepository(TaskEntity)
        private readonly taskRepository: Repository<TaskEntity>,
        private readonly cacheManagerService: CacheManagerService,
      ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    const { title, description } = command.task;
    const taskEntity = await this.taskRepository.save({title, description, status: TaskStatus.PENDING});

    await this.cacheManagerService.invalidateAllTasksCache();

    return Task.fromEntity(taskEntity)
  }
}
