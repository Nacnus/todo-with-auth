import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importlar

@Module({
  imports: [
    // registerAsync kullanıyoruz çünkü ConfigService'in yüklenmesini beklemeliyiz
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'), // .env'den okuyor
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
