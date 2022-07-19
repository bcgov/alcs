import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  Inject,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { BaseErrorResponseModel, BaseServiceException } from './base.exception';

@Catch(BaseServiceException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  catch(exception: BaseServiceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.logger.error(exception.message, exception.stack);

    response
      .status(status)
      .send(new BaseErrorResponseModel(status, exception.message, request.url));
  }
}
