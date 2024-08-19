import { UpdateTaskDto } from '../../presentation/dto/request/update-task.dto';

export class UpdateTaskCommand {
  constructor(
    public readonly id: string,
    public readonly task: UpdateTaskDto,
  ) {}
}
