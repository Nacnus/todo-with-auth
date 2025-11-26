import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { GetTodosFilterDto } from './dto/get-todos-filter.dto'; // Guard Importu

@ApiTags('Görevler (Todos)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni görev ekle' })
  create(@Request() req, @Body() createTodoDto: CreateTodoDto) {
    // req.user.sub = Token'ın içindeki User ID
    return this.todosService.create(req.user.sub, createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Benim görevlerimi listele' })
  findAll(@Request() req, @Query() filterDto: GetTodosFilterDto) {
    // URL'den gelen ?page=1&search=elma gibi bilgileri filterDto olarak alıyoruz
    return this.todosService.findAll(req.user.sub, filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tek bir görev detayını gör' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.todosService.findOne(req.user.sub, +id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Görevi güncelle' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.update(req.user.sub, +id, updateTodoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Görevi sil' })
  remove(@Request() req, @Param('id') id: string) {
    return this.todosService.remove(req.user.sub, +id);
  }
}
