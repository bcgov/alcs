import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseErrorResponseModel {
  constructor(statusCode: number, name: string, message: string, path?: string) {
    this.statusCode = statusCode;
    this.name = name;
    this.message = message;
    this.path = path;
  }

  statusCode: number;
  name: string;
  message: string;
  path: string | undefined;
}

export class BaseServiceException extends HttpException {
  constructor(error: string | Record<string, any>, status?: number, name?: string) {
    super(error, status ?? HttpStatus.INTERNAL_SERVER_ERROR);
    if (name) {
      this.name = name;
    }
  }
}

export class ServiceValidationException extends BaseServiceException {
  constructor(error: string | Record<string, any>, name?: string) {
    super(error, HttpStatus.BAD_REQUEST, name);
  }
}

export class ServiceNotFoundException extends BaseServiceException {
  constructor(error: string | Record<string, any>, name?: string) {
    super(error, HttpStatus.NOT_FOUND, name);
  }
}

export class ServiceConflictException extends BaseServiceException {
  constructor(error: string | Record<string, any>) {
    super(error, HttpStatus.CONFLICT);
  }
}

export class ServiceInternalErrorException extends BaseServiceException {
  constructor(error: string | Record<string, any>) {
    super(error, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
