import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { GetTodosFilterDto } from './dto/get-todos-filter.dto';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  // 1. OLUŞTURMA (User ID ile bağlıyoruz)
  async create(userId: number, createTodoDto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: {
        ...createTodoDto,
        userId: userId,
      },
    });
  }

  // 2. LİSTELEME (Sadece o kullanıcınınkiler)
  async findAll(userId: number, filterDto: GetTodosFilterDto) {
    const { page = 1, limit = 10, search } = filterDto;

    // 1. Arama Kriterini Oluştur (Where)
    const where: Prisma.TodoWhereInput = {
      userId: userId, // Herkes sadece kendi verisini görsün
      // Eğer search varsa başlıkta VEYA açıklamada ara
      AND: search
        ? [
            {
              OR: [
                { title: { contains: search } }, // Başlıkta ara
                { description: { contains: search } }, // Açıklamada ara
              ],
            },
          ]
        : undefined,
    };

    // 2. Veritabanından veriyi ve toplam sayıyı aynı anda çek
    const [todos, total] = await this.prisma.$transaction([
      this.prisma.todo.findMany({
        where,
        take: limit, // Kaç tane alayım?
        skip: (page - 1) * limit, // Kaç tane atlayayım? (Sayfa 1 ise 0 atla, Sayfa 2 ise 10 atla)
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.todo.count({ where }), // Toplam kaç kayıt var?
    ]);

    return {
      data: todos,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
        limit,
      },
    };
  }

  // 3. TEK KAYIT GETİRME (Güvenlik Kontrolü)
  async findOne(userId: number, id: number) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });

    // Durum 1: Kayıt hiç yok
    if (!todo) {
      throw new NotFoundException(`ID'si ${id} olan görev bulunamadı`); // 404 Döndürür
    }

    // Durum 2: Kayıt var ama kullanıcının ID'si tutmuyor
    if (todo.userId !== userId) {
      throw new ForbiddenException('Bu göreve erişim yetkiniz yok'); // 403 Döndürür
    }

    return todo;
  }

  // 4. GÜNCELLEME
  async update(userId: number, id: number, updateTodoDto: UpdateTodoDto) {
    await this.findOne(userId, id); // Önce kontrol et: Bu adamın yetkisi var mı?

    return this.prisma.todo.update({
      where: { id },
      data: updateTodoDto,
    });
  }

  // 5. SİLME
  async remove(userId: number, id: number) {
    await this.findOne(userId, id); // Önce kontrol et

    return this.prisma.todo.delete({ where: { id } });
  }
}
