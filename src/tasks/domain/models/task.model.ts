import {Task as TaskEntity} from '../entities/task.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

export class Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: TaskEntity): Task {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      status: entity.status as TaskStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
