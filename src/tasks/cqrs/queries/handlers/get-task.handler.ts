import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { CacheManagerService } from "src/tasks/caching/cache-manager.service";
import { Task as TaskEntity} from "src/tasks/domain/entities/task.entity";
import { Task } from "src/tasks/domain/models/task.model";
import { Repository } from "typeorm";
import { GetTaskQuery } from "../get-task.query";

@QueryHandler(GetTaskQuery)
export class GetTaskHandler implements IQueryHandler<GetTaskQuery> {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    private readonly cacheManagerService: CacheManagerService,
  ) {}
  async execute(): Promise<Task[]> {
    let tasks = await this.cacheManagerService.getAllTaskCache();
    if(!tasks){
        const entityTasks = await this.taskRepository.find();
        tasks = entityTasks.map(Task.fromEntity);

        await this.cacheManagerService.cacheTasks(tasks);
    }
    
    return tasks;
  }
}