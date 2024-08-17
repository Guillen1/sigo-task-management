import { Test, TestingModule } from '@nestjs/testing';
import { GetTaskByIdHandler } from './get-task-by-id.handler';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from 'src/tasks/domain/entities/task.entity';
import { CacheManagerService } from 'src/tasks/caching/cache-manager.service';
import { NotFoundException } from '@nestjs/common';
import { Task as TaskModel, TaskStatus } from 'src/tasks/domain/models/task.model';
import { GetTaskByIdQuery } from '../get-task-by-id.query';

describe('GetTaskByIdHandler', () => {
  let handler: GetTaskByIdHandler;
  let taskRepository: Repository<Task>;
  let cacheManagerService: CacheManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTaskByIdHandler,
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
        {
          provide: CacheManagerService,
          useValue: {
            getTaskFromCache: jest.fn(),
            cacheTask: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetTaskByIdHandler>(GetTaskByIdHandler);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    cacheManagerService = module.get<CacheManagerService>(CacheManagerService);
  });

  it('should return task from cache if found', async () => {
    const task = new TaskModel();
    task.id = '1';
    task.title = 'Test Task';
    task.description = 'Test Description';
    task.status = TaskStatus.PENDING;

    jest.spyOn(cacheManagerService, 'getTaskFromCache').mockResolvedValue(task);

    // This line ensures that `findOneBy` is a mocked function
    jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(null);

    const result = await handler.execute(new GetTaskByIdQuery('1'));

    expect(cacheManagerService.getTaskFromCache).toHaveBeenCalledWith('1');
    expect(result).toEqual(task);
    expect(taskRepository.findOneBy).not.toHaveBeenCalled();
    expect(cacheManagerService.cacheTask).not.toHaveBeenCalled();
  });

  it('should fetch task from database if not in cache and cache it', async () => {
    const taskEntity = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Task;

    jest.spyOn(cacheManagerService, 'getTaskFromCache').mockResolvedValue(null);
    jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(taskEntity);
    jest.spyOn(cacheManagerService, 'cacheTask').mockResolvedValue(undefined);

    const result = await handler.execute(new GetTaskByIdQuery('1'));

    expect(cacheManagerService.getTaskFromCache).toHaveBeenCalledWith('1');
    expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(cacheManagerService.cacheTask).toHaveBeenCalledWith(TaskModel.fromEntity(taskEntity));
    expect(result).toEqual(TaskModel.fromEntity(taskEntity));
  });

  it('should throw NotFoundException if task is not found in cache or database', async () => {
    jest.spyOn(cacheManagerService, 'getTaskFromCache').mockResolvedValue(null);
    jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(null);

    await expect(handler.execute(new GetTaskByIdQuery('1'))).rejects.toThrow(NotFoundException);

    expect(cacheManagerService.getTaskFromCache).toHaveBeenCalledWith('1');
    expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(cacheManagerService.cacheTask).not.toHaveBeenCalled();
  });
});
