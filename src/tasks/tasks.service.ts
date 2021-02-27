import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksFilterDto } from './dto/tasks-with-filters.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async getTasks(
    filterDto: TasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    return await this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: number, user: User,): Promise<Task> {

    const found = await this.taskRepository.findOne({ where: { id, userId: user.id }});

    if (!found) {
      throw new NotFoundException();
    }
    return found;
  }

  async create(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async remove(
    id: number,
    user: User,
  ): Promise<void> {
    const result = await this.taskRepository.delete({ id, userId: user.id});
    
    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }

  async update(id: number, status: TaskStatus, user: User): Promise<Task> {
    const taskToUpdate = await this.getTaskById(id, user);
    taskToUpdate.status = status;
    await taskToUpdate.save();

    return taskToUpdate;
  }
}
