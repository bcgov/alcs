import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateDocumentGrpcRequest } from '../document-grpc/alcs-document.message.interface';
import { Document } from '../document/document.entity';
import { DocumentService } from '../document/document.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { DocumentGrpcController } from './document-grpc.controller';
describe('DocumentGrpcController', () => {
  let controller: DocumentGrpcController;

  let mockDocumentService: DeepMocked<DocumentService>;
  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockDocumentService = createMock();
    mockUserService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentGrpcController],
      providers: [
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<DocumentGrpcController>(DocumentGrpcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to service to get url', async () => {
    const mockRes = {
      uploadUrl: 'mockUrl',
      fileKey: 'mockFileKey',
    };
    mockDocumentService.getUploadUrl.mockResolvedValue(mockRes);

    const res = await controller.getUploadUrl({ filePath: '' });

    expect(mockDocumentService.getUploadUrl).toBeCalledTimes(1);
    expect(res).toEqual(mockRes);
  });

  it('should call through to service to create documents when uploadedBy exists in ALCS', async () => {
    const mockDoc = {
      uuid: 'mock',
    };

    mockDocumentService.createDocumentRecord.mockResolvedValue(
      mockDoc as Document,
    );
    mockUserService.getByUuid.mockResolvedValue({ uuid: 'mockUser' } as User);

    const res = await controller.attachExternalDocument({
      uploadedByUuid: 'mockUser',
    } as CreateDocumentGrpcRequest);

    expect(mockDocumentService.createDocumentRecord).toBeCalledTimes(1);
    expect(mockUserService.getByUuid).toBeCalledTimes(1);
    expect(res).toEqual({ alcsDocumentUuid: mockDoc.uuid });
  });

  it('attachExternal should fail if wrong ALCS user provided as payload', async () => {
    const mockDoc = {
      uuid: 'mock',
    };

    mockDocumentService.createDocumentRecord.mockResolvedValue(
      mockDoc as Document,
    );
    mockUserService.getByUuid.mockResolvedValue(null);

    await expect(
      controller.attachExternalDocument({
        uploadedByUuid: 'mockUser',
      } as CreateDocumentGrpcRequest),
    ).rejects.toMatchObject(
      new BadRequestException(`User not found with uuid mockUser`),
    );

    expect(mockDocumentService.createDocumentRecord).toBeCalledTimes(0);
    expect(mockUserService.getByUuid).toBeCalledTimes(1);
  });

  it('attachExternal call through to service if no ALCS user provided', async () => {
    const mockDoc = {
      uuid: 'mock',
    };

    mockDocumentService.createDocumentRecord.mockResolvedValue(
      mockDoc as Document,
    );
    mockUserService.getByUuid.mockResolvedValue(null);

    const res = await controller.attachExternalDocument(
      {} as CreateDocumentGrpcRequest,
    );

    expect(mockDocumentService.createDocumentRecord).toBeCalledTimes(1);
    expect(mockUserService.getByUuid).toBeCalledTimes(0);
    expect(res).toEqual({ alcsDocumentUuid: mockDoc.uuid });
  });
});
