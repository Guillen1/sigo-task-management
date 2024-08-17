import { UpdateTaskDto } from "../../dto/request/update-task.dto";
import { TaskStatus } from "../../domain/models/task.model";

export class UpdateTaskCommand {
    constructor(
      public readonly id: string,
      public readonly task: UpdateTaskDto,
    ) {}
  }