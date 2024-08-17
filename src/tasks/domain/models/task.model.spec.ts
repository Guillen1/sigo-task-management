import { Task, TaskStatus } from './task.model';
import { Task as TaskEntity } from '../entities/task.entity';

describe('Task', () => {
  describe('fromEntity', () => {
    it('should convert a TaskEntity to a Task', () => {
      const entity: TaskEntity = {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          status: TaskStatus.PENDING,
          createdAt: new Date('2023-08-17T12:00:00Z'),
          updatedAt: new Date('2023-08-17T12:00:00Z'),
      };

      const task = Task.fromEntity(entity);

      expect(task).toEqual({
        id: entity.id,
        title: entity.title,
        description: entity.description,
        status: TaskStatus.PENDING,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
    });

    it('should handle status conversion correctly', () => {
      const entity: TaskEntity = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.IN_PROGRESS,
        createdAt: new Date('2023-08-17T12:00:00Z'),
        updatedAt: new Date('2023-08-17T12:00:00Z'),
      };

      const task = Task.fromEntity(entity);

      expect(task.status).toEqual(TaskStatus.IN_PROGRESS);
    });
  });
});
