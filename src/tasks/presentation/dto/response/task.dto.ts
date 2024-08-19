import { ApiProperty } from '@nestjs/swagger';
import { Task, TaskStatus } from '../../../domain/models/task.model';

export class TaskResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  status: TaskStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(task: Task): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
