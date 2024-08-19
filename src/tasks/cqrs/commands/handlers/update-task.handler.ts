import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateTaskCommand } from '../update-task.command';
import { Task as TaskEntity } from 'src/tasks/domain/entities/task.entity';
import { NotFoundException } from '@nestjs/common';
import { CacheManagerService } from 'src/tasks/caching/cache-manager.service';
import { Task } from 'src/tasks/domain/models/task.model';

@CommandHandler(UpdateTaskCommand)
export class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand> {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    private readonly cacheManagerService: CacheManagerService,
  ) {}

  async execute(command: UpdateTaskCommand): Promise<Task> {
    const { title, description, status } = command.task;
    const id = command.id;

    const task = await this.taskRepository.findOneBy({ id });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // If implementing status transition rules, ensure the transition is valid:
    // const currentStatus = task.status as TaskStatus;
    //
    // if (status && !this.isValidStatusTransition(currentStatus, status)) {
    //     throw new BadRequestException(
    //       `Invalid status transition from ${task.status} to ${status}`,
    //     );
    // }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;

    const taskUpdated = await this.taskRepository.save(task);

    await this.cacheManagerService.deleteTaskFromCache(id);

    await this.cacheManagerService.invalidateAllTasksCache();

    return Task.fromEntity(taskUpdated);
  }

  // /**
  //  * Validates if the status transition is allowed based on business rules.
  //  * @param currentStatus - The current status of the task.
  //  * @param newStatus - The new status to be set.
  //  * @returns `true` if the transition is valid; otherwise, `false`.
  //  */
  // private isValidStatusTransition(currentStatus: TaskStatus, newStatus: TaskStatus): boolean {
  //   const validTransitions = {
  //     [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS],
  //     [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED],
  //     [TaskStatus.COMPLETED]: [], // No transitions allowed from COMPLETED
  //   };

  //   return validTransitions[currentStatus].includes(newStatus);
  // }
}
