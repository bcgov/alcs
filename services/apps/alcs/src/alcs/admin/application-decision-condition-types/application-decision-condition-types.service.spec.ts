import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApplicationDecisionConditionType,
  DateLabel,
} from '../../application-decision/application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionConditionTypesService } from './application-decision-condition-types.service';
import { ServiceValidationException } from '@app/common/exceptions/base.exception';

describe('ApplicationDecisionConditionTypesService', () => {
  let service: ApplicationDecisionConditionTypesService;
  let mockRepository: DeepMocked<Repository<ApplicationDecisionConditionType>>;

  const type = new ApplicationDecisionConditionType();

  beforeEach(async () => {
    mockRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationDecisionConditionTypesService,
        {
          provide: getRepositoryToken(ApplicationDecisionConditionType),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationDecisionConditionTypesService>(ApplicationDecisionConditionTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully create decision condition type entry', async () => {
    mockRepository.save.mockResolvedValue(new ApplicationDecisionConditionType());
    mockRepository.exists.mockResolvedValue(false);

    const result = await service.create({
      code: '',
      description: '',
      label: '',
      isActive: true,
      isComponentToConditionChecked: true,
      isDescriptionChecked: true,
      isAdministrativeFeeAmountChecked: false,
      isAdministrativeFeeAmountRequired: false,
      administrativeFeeAmount: null,
      isSingleDateChecked: false,
      isSingleDateRequired: false,
      singleDateLabel: DateLabel.DUE_DATE,
      isSecurityAmountChecked: false,
      isSecurityAmountRequired: false,
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });

  it('should throw an error if code already exists when creating decision condition type', async () => {
    mockRepository.exists.mockResolvedValue(true);

    await expect(
      service.create({
        code: 'SAMPLE',
        description: '',
        label: '',
        isActive: true,
        isComponentToConditionChecked: true,
        isDescriptionChecked: true,
        isAdministrativeFeeAmountChecked: false,
        isAdministrativeFeeAmountRequired: false,
        administrativeFeeAmount: null,
        isSingleDateChecked: false,
        isSingleDateRequired: false,
        singleDateLabel: DateLabel.DUE_DATE,
        isSecurityAmountChecked: false,
        isSecurityAmountRequired: false,
      }),
    ).rejects.toThrow(ServiceValidationException);
  });

  it('should successfully update decision condition type entry if it exists', async () => {
    mockRepository.save.mockResolvedValue(type);
    mockRepository.findOneOrFail.mockResolvedValue(type);

    const result = await service.update(type.code, {
      code: '',
      description: '',
      label: '',
      isActive: true,
      isComponentToConditionChecked: true,
      isDescriptionChecked: true,
      isAdministrativeFeeAmountChecked: false,
      isAdministrativeFeeAmountRequired: false,
      administrativeFeeAmount: null,
      isSingleDateChecked: false,
      isSingleDateRequired: false,
      singleDateLabel: DateLabel.DUE_DATE,
      isSecurityAmountChecked: false,
      isSecurityAmountRequired: false,
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledWith({
      where: { uuid: type.code },
    });
    expect(result).toBeDefined();
  });

  it('should successfully fetch decision condition type', async () => {
    mockRepository.find.mockResolvedValue([type]);

    const result = await service.fetch();

    expect(mockRepository.find).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });
});
