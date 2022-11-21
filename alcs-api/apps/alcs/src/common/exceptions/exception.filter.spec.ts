import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './exception.filter';
import { mockAppLoggerService } from '../../../test/mocks/mockLogger';
import {
  mockArgumentsHost,
  mockGetRequest,
  mockGetResponse,
  mockHttpArgumentsHost,
  mockSend,
  mockStatus,
} from '../../../test/mocks/mockHttp';
import { BaseErrorResponseModel } from './base.exception';

describe('HttpExceptionFilter', () => {
  let service: HttpExceptionFilter;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpExceptionFilter,
        {
          provide: Logger,
          useValue: mockAppLoggerService,
        },
      ],
    }).compile();
    service = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  describe('All exception filter tests', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should call global HttpExceptionFilter', () => {
      const mockHttpException = new HttpException(
        { message: 'Sample Exception' },
        HttpStatus.BAD_REQUEST,
      );
      service.catch(mockHttpException, mockArgumentsHost);

      expect(mockHttpArgumentsHost).toBeCalledTimes(1);
      expect(mockHttpArgumentsHost).toBeCalledWith();
      expect(mockGetResponse).toBeCalledTimes(1);
      expect(mockGetResponse).toBeCalledWith();
      expect(mockStatus).toBeCalledTimes(1);
      expect(mockStatus).toBeCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockSend).toBeCalledTimes(1);
      expect(mockSend).toBeCalledWith(
        new BaseErrorResponseModel(
          mockHttpException.getStatus(),
          mockHttpException.message,
          mockGetRequest().url,
        ),
      );
    });
  });
});
