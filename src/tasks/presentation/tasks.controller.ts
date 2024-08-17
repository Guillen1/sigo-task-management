import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Task } from '../domain/models/task.model';
import { CreateTaskDto } from '../dto/request/create-task.dto';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TaskResponse } from '../dto/response/task.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTaskCommand } from '../cqrs/commands/create-task.command';
import { UpdateTaskDto } from '../dto/request/update-task.dto';
import { UpdateTaskCommand } from '../cqrs/commands/update-task.command';
import { GetTaskByIdQuery } from '../cqrs/queries/get-task-by-id.query';
import { GetTaskQuery } from '../cqrs/queries/get-task.query';
import { DeleteTaskCommand } from '../cqrs/commands/delete-task.command';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiCreatedResponse({
    description: 'The task has been successfully created.',
    type: TaskResponse,
  })
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    const task = await this.commandBus.execute(
      new CreateTaskCommand(createTaskDto),
    );

    return TaskResponse.fromEntity(task);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all tasks' })
  @ApiOkResponse({
    description: 'Return all tasks.',
    type: TaskResponse,
    isArray: true,
  })
  async getAllTasks(): Promise<TaskResponse[]> {
    const task = await this.queryBus.execute(new GetTaskQuery());

    return task.map(TaskResponse.fromEntity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific task by ID' })
  @ApiOkResponse({
    status: 200,
    description: 'Return a single task.',
    type: TaskResponse,
  })
  @ApiNotFoundResponse({
    description: 'Task not found.',
  })
  async getTaskById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TaskResponse> {
    const task = await this.queryBus.execute(new GetTaskByIdQuery(id));

    return TaskResponse.fromEntity(task);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update the status of a task' })
  @ApiOkResponse({
    description: 'The task status has been successfully updated.',
    type: TaskResponse,
  })
  @ApiNotFoundResponse({
    description: 'Task not found.',
  })
  async updateTaskStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.commandBus.execute(
      new UpdateTaskCommand(id, updateTaskDto),
    );

    return TaskResponse.fromEntity(task);
  }

  @Delete(':id')
  @ApiNoContentResponse({
    description: 'The task has been successfully deleted.',
  })
  @ApiNotFoundResponse({
    description: 'Task not found.',
  })
 async deleteTask(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.commandBus.execute(new DeleteTaskCommand(id));
  }
}
