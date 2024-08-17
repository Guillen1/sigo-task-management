import { Test, TestingModule } from '@nestjs/testing';
import { GetTaskHandler } from './get-task.handler';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from 'src/tasks/domain/entities/task.entity';
import { CacheManagerService } from 'src/tasks/caching/cache-manager.service';
import { Task as TaskModel, TaskStatus } from 'src/tasks/domain/models/task.model';

describe('GetTaskHandler', () => {
  let handler: GetTaskHandler;
  let taskRepository: Repository<Task>;
  let cacheManagerService: CacheManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTaskHandler,
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
        {
          provide: CacheManagerService,
          useValue: {
            getAllTaskCache: jest.fn(),
            cacheTasks: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetTaskHandler>(GetTaskHandler);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    cacheManagerService = module.get<CacheManagerService>(CacheManagerService);
    
    // Mock the find method
    jest.spyOn(taskRepository, 'find').mockResolvedValue([]);
  });

  it('should return tasks from cache if found', async () => {
    const tasks = [
      new TaskModel(),
      new TaskModel(),
    ];
    tasks[0].id = '1';
    tasks[0].title = 'Test Task 1';
    tasks[0].description = 'Test Description 1';
    tasks[0].status = TaskStatus.PENDING;

    tasks[1].id = '2';
    tasks[1].title = 'Test Task 2';
    tasks[1].description = 'Test Description 2';
    tasks[1].status = TaskStatus.IN_PROGRESS;

    jest.spyOn(cacheManagerService, 'getAllTaskCache').mockResolvedValue(tasks);

    const result = await handler.execute();

    expect(cacheManagerService.getAllTaskCache).toHaveBeenCalled();
    expect(result).toEqual(tasks);
    expect(taskRepository.find).not.toHaveBeenCalled(); // Ensure the database is not queried
    expect(cacheManagerService.cacheTasks).not.toHaveBeenCalled(); // Ensure no caching occurs
  });

  it('should fetch tasks from database if not in cache and cache them', async () => {
    const taskEntities = [
      {
        id: '1',
        title: 'Test Task 1',
        description: 'Test Description 1',
        status: TaskStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Test Task 2',
        description: 'Test Description 2',
        status: TaskStatus.IN_PROGRESS,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as Task[];

    jest.spyOn(cacheManagerService, 'getAllTaskCache').mockResolvedValue(null);
    jest.spyOn(taskRepository, 'find').mockResolvedValue(taskEntities);
    jest.spyOn(cacheManagerService, 'cacheTasks').mockResolvedValue(undefined);

    const result = await handler.execute();

    expect(cacheManagerService.getAllTaskCache).toHaveBeenCalled();
    expect(taskRepository.find).toHaveBeenCalled(); // Ensure the database is queried
    expect(cacheManagerService.cacheTasks).toHaveBeenCalledWith(taskEntities.map(TaskModel.fromEntity)); // Ensure tasks are cached
    expect(result).toEqual(taskEntities.map(TaskModel.fromEntity)); // Ensure the correct result is returned
  });
});
