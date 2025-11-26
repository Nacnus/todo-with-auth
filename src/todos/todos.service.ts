import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from '../prisma.service'; // Importa dikkat!

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  // 1. OLUŞTURMA (User ID ile bağlıyoruz)
  async create(userId: number, createTodoDto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: {
        ...createTodoDto,
        userId: userId, // <-- İŞTE İLİŞKİ BURADA KURULUYOR
      },
    });
  }

  // 2. LİSTELEME (Sadece o kullanıcınınkiler)
  async findAll(userId: number) {
    return this.prisma.todo.findMany({
      where: { userId: userId }, // <-- FİLTRELEME
      orderBy: { createdAt: 'desc' }, // En yeniler üstte
    });
  }

  // 3. TEK KAYIT GETİRME (Güvenlik Kontrolü)
  async findOne(userId: number, id: number) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });

    // Todo yoksa VEYA Todo başkasına aitse hata ver
    if (!todo || todo.userId !== userId) {
      throw new NotFoundException('Görev bulunamadı veya size ait değil');
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
