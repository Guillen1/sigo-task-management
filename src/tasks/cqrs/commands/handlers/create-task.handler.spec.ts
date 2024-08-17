import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskHandler } from './create-task.handler';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManagerService } from 'src/tasks/caching/cache-manager.service';
import { Task as TaskEntity } from 'src/tasks/domain/entities/task.entity';
import { CreateTaskCommand } from '../create-task.command';
import { TaskStatus, Task } from 'src/tasks/domain/models/task.model';

describe('CreateTaskHandler', () => {
  let handler: CreateTaskHandler;
  let taskRepository: Repository<TaskEntity>;
  let cacheManagerService: CacheManagerService;
  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskHandler,
        {
          provide: getRepositoryToken(TaskEntity),
          useClass: Repository,
        },
        {
          provide: CacheManagerService,
          useValue: {
            invalidateAllTasksCache: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateTaskHandler>(CreateTaskHandler);
    taskRepository = module.get<Repository<TaskEntity>>(getRepositoryToken(TaskEntity));
    cacheManagerService = module.get<CacheManagerService>(CacheManagerService);
  });

  it('should create a new task and invalidate the cache', async () => {
    const command = new CreateTaskCommand({ title: 'Test Task', description: 'Test Description' });
    const savedTaskEntity = {
      id: '1',
      title: command.task.title,
      description: command.task.description,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(taskRepository, 'save').mockResolvedValue( savedTaskEntity as TaskEntity);
    jest.spyOn(Task, 'fromEntity').mockReturnValue({
      ...savedTaskEntity,
    });

    const result = await handler.execute(command);

    expect(taskRepository.save).toHaveBeenCalledWith({
      title: command.task.title,
      description: command.task.description,
      status: TaskStatus.PENDING,
    });

    expect(cacheManagerService.invalidateAllTasksCache).toHaveBeenCalled();

    expect(result).toEqual(Task.fromEntity(savedTaskEntity as TaskEntity));
  });
});
