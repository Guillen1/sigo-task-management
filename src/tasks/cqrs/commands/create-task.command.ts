import { CreateTaskDto } from '../../dto/request/create-task.dto';

export class CreateTaskCommand {
  constructor(public readonly task: CreateTaskDto) {}
}
