import { CreateTaskDto } from '../../presentation/dto/request/create-task.dto';

export class CreateTaskCommand {
  constructor(public readonly task: CreateTaskDto) {}
}
