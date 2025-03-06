import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { ApplicationDecisionConditionFinancialInstrumentService } from './application-decision-condition-financial-instrument.service';
import {
  ApplicationDecisionConditionFinancialInstrumentDto,
  CreateUpdateApplicationDecisionConditionFinancialInstrumentDto,
} from './application-decision-condition-financial-instrument.dto';
import {
  HeldBy,
  InstrumentStatus,
  InstrumentType,
} from '../../../../../common/decision-condition-financial-instrument/decision-condition-financial-instrument.dto';
import { environment } from '../../../../../../../environments/environment';

describe('ApplicationDecisionConditionFinancialInstrumentService', () => {
  let service: ApplicationDecisionConditionFinancialInstrumentService;
  let mockHttpClient: DeepMocked<HttpClient>;
  const conditionId = '1';
  const instrumentId = '1';
  let expectedUrl: string;

  beforeEach(() => {
    mockHttpClient = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
    });
    service = TestBed.inject(ApplicationDecisionConditionFinancialInstrumentService);
    expectedUrl = `${environment.apiUrl}/v2/application-decision-condition/${conditionId}/financial-instruments`;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make an http get for getAll', async () => {
    const mockResponse: ApplicationDecisionConditionFinancialInstrumentDto[] = [
      {
        uuid: '1',
        securityHolderPayee: 'Payee',
        type: InstrumentType.BANK_DRAFT,
        issueDate: 1627849200000,
        amount: 1000,
        bank: 'Bank',
        heldBy: HeldBy.ALC,
        receivedDate: 1627849200000,
        status: InstrumentStatus.RECEIVED,
        instrumentNumber: '123',
      },
    ];

    mockHttpClient.get.mockReturnValue(of(mockResponse));

    const result = await service.getAll(conditionId);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockResponse);
  });

  it('should show an error if getAll fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 500, error: { message: 'Failed to retrieve the financial instruments' } }),
      ),
    );

    await expect(service.getAll(conditionId)).rejects.toThrow('Failed to retrieve the financial instruments');

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get).toHaveBeenCalledWith(expectedUrl);
  });

  it('should make an http get for get', async () => {
    const mockResponse: ApplicationDecisionConditionFinancialInstrumentDto = {
      uuid: '1',
      securityHolderPayee: 'Payee',
      type: InstrumentType.BANK_DRAFT,
      issueDate: 1627849200000,
      amount: 1000,
      bank: 'Bank',
      heldBy: HeldBy.ALC,
      receivedDate: 1627849200000,
      status: InstrumentStatus.RECEIVED,
      instrumentNumber: '123',
    };

    mockHttpClient.get.mockReturnValue(of(mockResponse));

    const result = await service.get(conditionId, instrumentId);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get).toHaveBeenCalledWith(`${expectedUrl}/${instrumentId}`);
    expect(result).toEqual(mockResponse);
  });

  it('should show an error if get fails', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 500, error: { message: 'Failed to retrieve the financial instruments' } }),
      ),
    );

    await expect(service.get(conditionId, instrumentId)).rejects.toThrow(
      new Error('Failed to retrieve the financial instruments'),
    );

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get).toHaveBeenCalledWith(`${expectedUrl}/${instrumentId}`);
  });

  it('should make an http post for create', async () => {
    const mockRequest: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto = {
      securityHolderPayee: 'Payee',
      type: InstrumentType.BANK_DRAFT,
      issueDate: 1627849200000,
      amount: 1000,
      bank: 'Bank',
      heldBy: HeldBy.ALC,
      receivedDate: 1627849200000,
      status: InstrumentStatus.RECEIVED,
      instrumentNumber: '123',
    };

    const mockResponse: ApplicationDecisionConditionFinancialInstrumentDto = {
      uuid: '1',
      ...mockRequest,
    };

    mockHttpClient.post.mockReturnValue(of(mockResponse));

    const result = await service.create(conditionId, mockRequest);

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post).toHaveBeenCalledWith(expectedUrl, mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should show an error if create fails', async () => {
    const mockRequest: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto = {
      securityHolderPayee: 'Payee',
      type: InstrumentType.BANK_DRAFT,
      issueDate: 1627849200000,
      amount: 1000,
      bank: 'Bank',
      heldBy: HeldBy.ALC,
      receivedDate: 1627849200000,
      status: InstrumentStatus.RECEIVED,
      instrumentNumber: '123',
    };

    mockHttpClient.post.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 500, error: { message: 'Failed to retrieve the financial instruments' } }),
      ),
    );

    await expect(service.create(conditionId, mockRequest)).rejects.toThrow(
      new Error('Failed to retrieve the financial instruments'),
    );

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.post).toHaveBeenCalledWith(expectedUrl, mockRequest);
  });

  it('should make an http patch for update', async () => {
    const mockRequest: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto = {
      securityHolderPayee: 'Payee',
      type: InstrumentType.BANK_DRAFT,
      issueDate: 1627849200000,
      amount: 1000,
      bank: 'Bank',
      heldBy: HeldBy.ALC,
      receivedDate: 1627849200000,
      status: InstrumentStatus.RECEIVED,
      instrumentNumber: '123',
    };

    const mockResponse: ApplicationDecisionConditionFinancialInstrumentDto = {
      uuid: '1',
      ...mockRequest,
    };

    mockHttpClient.patch.mockReturnValue(of(mockResponse));

    const result = await service.update(conditionId, instrumentId, mockRequest);

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.patch).toHaveBeenCalledWith(`${expectedUrl}/${instrumentId}`, mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should show an error if update fails', async () => {
    const mockRequest: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto = {
      securityHolderPayee: 'Payee',
      type: InstrumentType.BANK_DRAFT,
      issueDate: 1627849200000,
      amount: 1000,
      bank: 'Bank',
      heldBy: HeldBy.ALC,
      receivedDate: 1627849200000,
      status: InstrumentStatus.RECEIVED,
      instrumentNumber: '123',
    };

    mockHttpClient.patch.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 500, error: { message: 'Failed to retrieve the financial instruments' } }),
      ),
    );

    await expect(service.update(conditionId, instrumentId, mockRequest)).rejects.toThrow(
      new Error('Failed to retrieve the financial instruments'),
    );

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.patch).toHaveBeenCalledWith(`${expectedUrl}/${instrumentId}`, mockRequest);
  });

  it('should make an http delete for delete', async () => {
    mockHttpClient.delete.mockReturnValue(of({}));

    await service.delete(conditionId, instrumentId);

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.delete).toHaveBeenCalledWith(`${expectedUrl}/${instrumentId}`);
  });

  it('should show an error if delete fails', async () => {
    mockHttpClient.delete.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 500, error: { message: 'Failed to retrieve the financial instruments' } }),
      ),
    );

    await expect(service.delete(conditionId, instrumentId)).rejects.toThrow(
      new Error('Failed to retrieve the financial instruments'),
    );

    expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.delete).toHaveBeenCalledWith(`${expectedUrl}/${instrumentId}`);
  });

  it('should remove statusDate and explanation when status is RECEIVED during update', async () => {
    const mockRequest: CreateUpdateApplicationDecisionConditionFinancialInstrumentDto = {
      securityHolderPayee: 'Payee',
      type: InstrumentType.BANK_DRAFT,
      issueDate: 1627849200000,
      amount: 1000,
      bank: 'Bank',
      heldBy: HeldBy.ALC,
      receivedDate: 1627849200000,
      status: InstrumentStatus.RECEIVED,
      statusDate: 1672531200000,
      explanation: 'test',
      instrumentNumber: '123',
    };

    const mockResponse: ApplicationDecisionConditionFinancialInstrumentDto = {
      uuid: '1',
      ...mockRequest,
    };

    mockHttpClient.patch.mockReturnValue(of(mockResponse));

    await service.update(conditionId, instrumentId, mockRequest);

    expect(mockHttpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.patch).toHaveBeenCalledWith(`${expectedUrl}/${instrumentId}`, {
      securityHolderPayee: 'Payee',
      type: InstrumentType.BANK_DRAFT,
      issueDate: 1627849200000,
      amount: 1000,
      bank: 'Bank',
      heldBy: HeldBy.ALC,
      receivedDate: 1627849200000,
      status: InstrumentStatus.RECEIVED,
      instrumentNumber: '123',
    });
  });

  it('should throw Condition/financial instrument not found', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 404, error: { message: 'Condition/financial instrument not found' } }),
      ),
    );

    await expect(service.get(conditionId, instrumentId)).rejects.toThrow(
      new Error('Condition/financial instrument not found'),
    );
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get).toHaveBeenCalledWith(`${expectedUrl}/${instrumentId}`);
  });

  it('should throw Condition is not of type Financial Security', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 400, error: { message: 'Condition is not of type Financial Security' } }),
      ),
    );

    await expect(service.get(conditionId, instrumentId)).rejects.toThrow(
      new Error('Condition is not of type Financial Security'),
    );
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get).toHaveBeenCalledWith(`${expectedUrl}/${instrumentId}`);
  });

  it('should throw Condition type Financial Security not found', async () => {
    mockHttpClient.get.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 500, error: { message: 'Condition type Financial Security not found' } }),
      ),
    );

    await expect(service.get(conditionId, instrumentId)).rejects.toThrow(
      new Error('Condition type Financial Security not found'),
    );
    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.get).toHaveBeenCalledWith(`${expectedUrl}/${instrumentId}`);
  });
});
