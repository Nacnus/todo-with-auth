import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException) // Sadece HTTP hatalarını (404, 403, 400 vs.) yakala
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Hata mesajını düzgünce ayıkla (Bazen string, bazen array gelir)
    let errorMessage = 'Bir hata oluştu';

    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse['message']
    ) {
      // Özellikle ValidationPipe array dönerse burası yakalar
      errorMessage = exceptionResponse['message'];
    }

    // STANDART HATA FORMATIMIZ
    response.status(status).json({
      statusCode: status,
      success: false, // Frontend buna bakıp hata olduğunu anlar
      message: errorMessage,
      path: request.url, // Hatanın olduğu adres
      timestamp: new Date().toISOString(), // Hatanın olduğu zaman
    });
  }
}
