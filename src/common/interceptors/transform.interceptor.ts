import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Dönecek standart cevabın şablonu (TypeScript Interface)
export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        // 1. HTTP Status Kodunu otomatik al (200, 201 vs.)
        statusCode: context.switchToHttp().getResponse().statusCode,

        // 2. Standart mesaj (İstersen özelleştirebilirsin)
        message: 'İşlem Başarılı',

        // 3. Controller'dan gelen veriyi 'data' kutusuna koy
        // Eğer data zaten { data: ..., meta: ... } formatındaysa (Pagination gibi) bozma
        data: data,
      })),
    );
  }
}
