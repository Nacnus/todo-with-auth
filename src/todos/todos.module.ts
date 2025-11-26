// src/todos/todos.module.ts
import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // 2. Modülü buraya ekleyin
  controllers: [TodosController],
  providers: [TodosService, PrismaService],
})
export class TodosModule {}
