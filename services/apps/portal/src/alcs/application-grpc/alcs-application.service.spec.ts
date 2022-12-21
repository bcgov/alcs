import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom, of } from 'rxjs';
import {
  ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME,
  ApplicationCreateGrpcRequest,
  ApplicationFileNumberGenerateGrpcResponse,
  ApplicationGrpcResponse,
} from './alcs-application.message.interface';
import { AlcsApplicationService } from './alcs-application.service';
import { AlcsApplicationServiceClient } from './alcs-application.service.interface';

describe('AlcsApplicationService', () => {
  let service: AlcsApplicationService;
  let alcsApplicationServiceCLientMock: DeepMocked<AlcsApplicationServiceClient>;

  beforeEach(async () => {
    alcsApplicationServiceCLientMock = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlcsApplicationService,
        {
          provide: ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME,
          useFactory: () => ({
            getService: () => alcsApplicationServiceCLientMock,
          }),
        },
      ],
    }).compile();

    await module.init();

    service = module.get<AlcsApplicationService>(AlcsApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.create).toBeDefined();
    expect(service.generateFileNumber).toBeDefined();
  });

  it('should call service to create application in alcs', async () => {
    const fileNumber = { fileNumber: 'file-id' };
    alcsApplicationServiceCLientMock.create.mockReturnValue(
      of(fileNumber as ApplicationGrpcResponse),
    );
    const result = await firstValueFrom(
      service.create(fileNumber as ApplicationCreateGrpcRequest),
    );

    expect(result).toEqual(fileNumber);
    expect(alcsApplicationServiceCLientMock.create).toBeCalledTimes(1);
  });

  it('should call service to get generated file number from alcs', async () => {
    const fileNumber = { fileNumber: 'file-id' };
    alcsApplicationServiceCLientMock.generateFileNumber.mockReturnValue(
      of(fileNumber as ApplicationFileNumberGenerateGrpcResponse),
    );
    const result = await firstValueFrom(service.generateFileNumber());

    expect(result).toEqual(fileNumber);
    expect(alcsApplicationServiceCLientMock.generateFileNumber).toBeCalledTimes(
      1,
    );
  });
});
