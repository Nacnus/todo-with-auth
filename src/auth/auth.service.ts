import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // KAYIT (REGISTER)
  async register(dto: AuthDto) {
    // 1. Email kontrolü
    const existUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existUser) throw new BadRequestException('Bu email zaten kullanımda');

    // 2. Şifreyi hashle
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Kaydet
    return this.prisma.user.create({
      data: { email: dto.email, password: hashedPassword },
    });
  }

  // GİRİŞ (LOGIN)
  async login(dto: AuthDto) {
    // 1. Kullanıcıyı bul
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı');

    // 2. Şifreyi kıyasla
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Şifre yanlış');

    // 3. Token ver (User ID'sini içine gömüyoruz: sub)
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
