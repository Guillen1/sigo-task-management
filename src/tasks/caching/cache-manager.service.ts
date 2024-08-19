import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Task } from '../domain/models/task.model';
import { Redis } from 'ioredis';

@Injectable()
export class CacheManagerService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async getTaskFromCache(taskId: string): Promise<Task | null> {
    const cachedTask = await this.redis.get(`task:${taskId}`);
    return cachedTask ? JSON.parse(cachedTask) : null;
  }

  async cacheTask(task: Task): Promise<void> {
    await this.redis.set(`task:${task.id}`, JSON.stringify(task), 'EX', 3600); // Cache for 1 hour
  }

  async deleteTaskFromCache(taskId: string): Promise<void> {
    await this.redis.del(`task:${taskId}`);
  }

  async getAllTaskCache(): Promise<Task[] | null> {
    const cachedTasks = await this.redis.get('tasks:all');
    return cachedTasks ? JSON.parse(cachedTasks) : null;
  }

  async cacheTasks(tasks: Task[]): Promise<void> {
    await this.redis.set('tasks:all', JSON.stringify(tasks), 'EX', 3600); // Cache for 1 hour
  }

  async invalidateAllTasksCache(): Promise<void> {
    await this.redis.del('tasks:all');
  }
}
