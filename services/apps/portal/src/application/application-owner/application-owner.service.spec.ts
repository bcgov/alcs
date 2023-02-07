import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../document/document.entity';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { ApplicationParcel } from '../application-parcel/application-parcel.entity';
import { ApplicationParcelService } from '../application-parcel/application-parcel.service';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationOwnerType } from './application-owner-type/application-owner-type.entity';
import { ApplicationOwner } from './application-owner.entity';
import { ApplicationOwnerService } from './application-owner.service';

describe('ApplicationOwnerService', () => {
  let service: ApplicationOwnerService;
  let mockParcelService: DeepMocked<ApplicationParcelService>;
  let mockRepo: DeepMocked<Repository<ApplicationOwner>>;
  let mockTypeRepo: DeepMocked<Repository<ApplicationOwnerType>>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockApplicationservice: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockParcelService = createMock();
    mockRepo = createMock();
    mockTypeRepo = createMock();
    mockDocumentService = createMock();
    mockApplicationservice = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationOwnerService,
        {
          provide: ApplicationParcelService,
          useValue: mockParcelService,
        },
        {
          provide: getRepositoryToken(ApplicationOwner),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(ApplicationOwnerType),
          useValue: mockTypeRepo,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationservice,
        },
      ],
    }).compile();

    service = module.get<ApplicationOwnerService>(ApplicationOwnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call find for find', async () => {
    mockRepo.find.mockResolvedValue([new ApplicationOwner()]);

    await service.fetchByApplicationFileId('');

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
  });

  it('should load the type and then call save for create', async () => {
    mockRepo.save.mockResolvedValue(new ApplicationOwner());
    mockTypeRepo.findOneOrFail.mockResolvedValue(new ApplicationOwnerType());

    await service.create(
      {
        applicationFileNumber: '',
        email: '',
        phoneNumber: '',
        typeCode: '',
      },
      new Application(),
    );

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockTypeRepo.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should load the type/parcel and then call save for attachToParcel', async () => {
    const owner = new ApplicationOwner({
      parcels: [],
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new ApplicationOwner());
    mockParcelService.getOneOrFail.mockResolvedValue(new ApplicationParcel());

    await service.attachToParcel('', '');

    expect(owner.parcels.length).toEqual(1);
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockParcelService.getOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should remove the parcel from the array then call save for removeFromParcel', async () => {
    const parcelUuid = '1';
    const owner = new ApplicationOwner({
      parcels: [
        new ApplicationParcel({
          uuid: parcelUuid,
        }),
      ],
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new ApplicationOwner());

    await service.removeFromParcel('', parcelUuid);

    expect(owner.parcels.length).toEqual(0);
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should set properties and call save for update', async () => {
    const owner = new ApplicationOwner({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new ApplicationOwner());

    await service.update('', {
      firstName: 'I Am',
      lastName: 'Batman',
      email: '',
      phoneNumber: '',
      typeCode: '',
    });

    expect(owner.firstName).toEqual('I Am');
    expect(owner.lastName).toEqual('Batman');
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should delete the existing document when updating', async () => {
    const owner = new ApplicationOwner({
      firstName: 'Bruce',
      lastName: 'Wayne',
      corporateSummaryUuid: 'oldUuid',
      corporateSummary: new Document(),
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new ApplicationOwner());
    mockDocumentService.delete.mockResolvedValue({} as any);

    await service.update('', {
      organizationName: '',
      email: '',
      phoneNumber: '',
      typeCode: '',
      corporateSummaryUuid: 'newUuid',
    });

    expect(owner.corporateSummaryUuid).toEqual('newUuid');
    expect(mockDocumentService.delete).toHaveBeenCalledTimes(1);
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(2);
  });

  it('should call through for delete', async () => {
    mockRepo.remove.mockResolvedValue({} as any);

    await service.delete(new ApplicationOwner());

    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
  });

  it('should call through for verify', async () => {
    mockRepo.findOneOrFail.mockResolvedValue(new ApplicationOwner());

    await service.getByOwner(new User(), '');

    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should call through for getMany', async () => {
    mockRepo.find.mockResolvedValue([new ApplicationOwner()]);

    await service.getMany([]);

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
  });
});
