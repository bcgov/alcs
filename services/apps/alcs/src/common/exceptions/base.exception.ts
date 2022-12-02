import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseErrorResponseModel {
  constructor(statusCode: number, message: string, path?: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.path = path;
  }

  statusCode: number;
  path: string | undefined;
  message: string;
}

export class BaseServiceException extends HttpException {
  constructor(error: string | Record<string, any>, status?: number) {
    super(error, status ?? HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ServiceValidationException extends BaseServiceException {
  constructor(error: string | Record<string, any>) {
    super(error, HttpStatus.BAD_REQUEST);
  }
}

export class ServiceNotFoundException extends BaseServiceException {
  constructor(error: string | Record<string, any>) {
    super(error, HttpStatus.NOT_FOUND);
  }
}
