import { Task, TaskStatus } from '../../domain/models/task.model';
import { TaskResponse } from './task.dto';

describe('TaskResponse', () => {
  describe('fromEntity', () => {
    it('should convert a Task to a TaskResponse', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        createdAt: new Date('2023-08-17T12:00:00Z'),
        updatedAt: new Date('2023-08-17T12:00:00Z'),
      };

      const taskResponse = TaskResponse.fromEntity(task);

      expect(taskResponse).toEqual({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    });

    it('should handle status conversion correctly', () => {
      const task: Task = {
        id: '2',
        title: 'Another Task',
        description: 'Another Description',
        status: TaskStatus.COMPLETED, // Testing different status
        createdAt: new Date('2023-09-17T12:00:00Z'),
        updatedAt: new Date('2023-09-17T12:00:00Z'),
      };

      const taskResponse = TaskResponse.fromEntity(task);

      expect(taskResponse.status).toEqual(TaskStatus.COMPLETED);
    });
  });
});
