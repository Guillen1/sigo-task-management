import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTaskHandler } from './update-task.handler';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task as TaskEntity } from 'src/tasks/domain/entities/task.entity';
import { CacheManagerService } from 'src/tasks/caching/cache-manager.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateTaskCommand } from '../update-task.command';
import { Task, TaskStatus } from 'src/tasks/domain/models/task.model';

describe('UpdateTaskHandler', () => {
  let handler: UpdateTaskHandler;
  let taskRepository: Repository<TaskEntity>;
  let cacheManagerService: CacheManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTaskHandler,
        {
          provide: getRepositoryToken(TaskEntity),
          useClass: Repository,
        },
        {
          provide: CacheManagerService,
          useValue: {
            deleteTaskFromCache: jest.fn(),
            invalidateAllTasksCache: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateTaskHandler>(UpdateTaskHandler);
    taskRepository = module.get<Repository<TaskEntity>>(
      getRepositoryToken(TaskEntity),
    );
    cacheManagerService = module.get<CacheManagerService>(CacheManagerService);

    jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(null);
    jest.spyOn(taskRepository, 'save').mockResolvedValue(null);
  });

  it('should update the task and invalidate the cache', async () => {
    const command = new UpdateTaskCommand('1', {
      title: 'Updated Task',
      description: 'Updated Description',
      status: TaskStatus.IN_PROGRESS,
    });
    const task = {
      id: '1',
      title: 'Original Title',
      description: 'Original Description',
      status: TaskStatus.PENDING,
    } as TaskEntity;

    const updatedTask = {
      ...task,
      title: command.task.title,
      description: command.task.description,
      status: command.task.status,
    };

    jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(task);
    jest.spyOn(taskRepository, 'save').mockResolvedValue(updatedTask);

    const result = await handler.execute(command);

    expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(taskRepository.save).toHaveBeenCalledWith(updatedTask);
    expect(cacheManagerService.deleteTaskFromCache).toHaveBeenCalledWith('1');
    expect(cacheManagerService.invalidateAllTasksCache).toHaveBeenCalled();
    expect(result).toEqual(Task.fromEntity(updatedTask));
  });

  it('should throw NotFoundException if the task does not exist', async () => {
    const command = new UpdateTaskCommand('1', {
      title: 'Updated Task',
      description: 'Updated Description',
      status: TaskStatus.IN_PROGRESS,
    });

    jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(taskRepository.save).not.toHaveBeenCalled();
    expect(cacheManagerService.deleteTaskFromCache).not.toHaveBeenCalled();
    expect(cacheManagerService.invalidateAllTasksCache).not.toHaveBeenCalled();
  });
});
