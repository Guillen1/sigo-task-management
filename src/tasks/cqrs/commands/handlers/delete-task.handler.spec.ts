import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTaskHandler } from './delete-task.handler';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from 'src/tasks/domain/entities/task.entity';
import { CacheManagerService } from 'src/tasks/caching/cache-manager.service';
import { NotFoundException } from '@nestjs/common';
import { DeleteTaskCommand } from '../delete-task.command';

describe('DeleteTaskHandler', () => {
  let handler: DeleteTaskHandler;
  let taskRepository: Repository<Task>;
  let cacheManagerService: CacheManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTaskHandler,
        {
          provide: getRepositoryToken(Task),
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

    handler = module.get<DeleteTaskHandler>(DeleteTaskHandler);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    cacheManagerService = module.get<CacheManagerService>(CacheManagerService);

    jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(null);
    jest.spyOn(taskRepository, 'delete').mockResolvedValue(undefined);
  });

  it('should delete the task and invalidate the cache', async () => {
    const command = new DeleteTaskCommand('1');
    const task = { id: '1', title: 'Test Task', description: 'Test Description' } as Task;

    jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(task);
    jest.spyOn(taskRepository, 'delete').mockResolvedValue(undefined);

    await handler.execute(command);

    expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(taskRepository.delete).toHaveBeenCalledWith('1');
    expect(cacheManagerService.deleteTaskFromCache).toHaveBeenCalledWith('1');
    expect(cacheManagerService.invalidateAllTasksCache).toHaveBeenCalled();
  });

  it('should throw NotFoundException if the task does not exist', async () => {
    const command = new DeleteTaskCommand('1');

    jest.spyOn(taskRepository, 'findOneBy').mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(taskRepository.delete).not.toHaveBeenCalled();  // Ensure this is not called
    expect(cacheManagerService.deleteTaskFromCache).not.toHaveBeenCalled();  // Ensure this is not called
    expect(cacheManagerService.invalidateAllTasksCache).not.toHaveBeenCalled();  // Ensure this is not called
  });
});
