import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TodosService', () => {
  let service: TodosService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    // 1. SAHTE ORTAMI KURUYORUZ
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(), // Gerçek Prisma yerine kuklasını kullan
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    prisma = module.get(PrismaService);
  });

  it('tanımlı olmalı', () => {
    expect(service).toBeDefined();
  });

  // --- SENARYO 1: BAŞARILI GETİRME ---
  it('findOne -> Görev varsa ve kullanıcıya aitse dönmeli', async () => {
    // 1. Hazırlık (Arrange)
    const userId = 1;
    const todoId = 5;
    const sahteTodo = {
      id: todoId,
      userId: userId,
      title: 'Test',
      description: null,
      isCompleted: false,
      createdAt: new Date(),
    };

    // Prisma'ya öğret: "findUnique çağrılırsa bu sahte datayı dön"
    prisma.todo.findUnique.mockResolvedValue(sahteTodo);

    // 2. Eylem (Act)
    const result = await service.findOne(userId, todoId);

    // 3. Kontrol (Assert)
    expect(result).toEqual(sahteTodo); // Sonuç sahte veriyle aynı mı?
    expect(prisma.todo.findUnique).toHaveBeenCalledWith({
      where: { id: todoId },
    }); // Prisma gerçekten çağrıldı mı?
  });

  // --- SENARYO 2: BULUNAMADI (404) ---
  it('findOne -> Görev yoksa NotFoundException fırlatmalı', async () => {
    const userId = 1;
    const todoId = 99;

    // Prisma'ya öğret: "Hiçbir şey bulamadın, null dön"
    prisma.todo.findUnique.mockResolvedValue(null);

    // Eylem ve Kontrol (Hata fırlatmasını bekliyoruz)
    await expect(service.findOne(userId, todoId)).rejects.toThrow(
      NotFoundException,
    );
  });

  // --- SENARYO 3: YETKİSİZ ERİŞİM (403) ---
  it('findOne -> Görev başkasına aitse ForbiddenException fırlatmalı', async () => {
    const userId = 1; // Ben
    const todoId = 5;
    const baskaUser = 2; // Görevin sahibi başkası

    const sahteTodo = {
      id: todoId,
      userId: baskaUser, // <--- DİKKAT: ID'ler tutmuyor
      title: 'Gizli Görev',
      description: null,
      isCompleted: false,
      createdAt: new Date(),
    };

    prisma.todo.findUnique.mockResolvedValue(sahteTodo);

    // Hata fırlatmalı
    await expect(service.findOne(userId, todoId)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
