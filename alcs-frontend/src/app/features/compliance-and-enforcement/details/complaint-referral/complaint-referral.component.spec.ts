import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplaintReferralComponent } from './complaint-referral.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../services/toast/toast.service';
import { firstValueFrom, of, Subject } from 'rxjs';
import { ComplianceAndEnforcementDto } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { HttpClient } from '@angular/common/http';

describe('ComplaintReferralComponent', () => {
  let component: ComplaintReferralComponent;
  let fixture: ComponentFixture<ComplaintReferralComponent>;
  let mockActivatedRoute: DeepMocked<ActivatedRoute>;
  let mockRouter: DeepMocked<Router>;
  let mockService: DeepMocked<ComplianceAndEnforcementService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;

  beforeEach(async () => {
    mockActivatedRoute = createMock<ActivatedRoute>();
    mockRouter = createMock<Router>();
    mockService = createMock<ComplianceAndEnforcementService>();
    mockToastService = createMock<ToastService>();
    mockHttpClient = createMock<HttpClient>();

    TestBed.configureTestingModule({
      imports: [],
      declarations: [ComplaintReferralComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ComplianceAndEnforcementService,
          useValue: mockService,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
    });

    fixture = TestBed.createComponent(ComplaintReferralComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set editing from route data on ngOnInit', () => {
    const editing = 'overview';
    mockActivatedRoute.snapshot.data = { editing };

    component.ngOnInit();

    expect(component.editing).toBe(editing);
  });

  it('should set file, fileNumber, and submissionDocumentOptions.fileId from service.$file', () => {
    const fileSubject = new Subject<any>();
    mockService.$file = fileSubject as any;
    component.ngOnInit();
    const file = { fileNumber: '123' };

    fileSubject.next(file);

    expect(component.file).toBe(file);
    expect(component.fileNumber).toBe('123');
    expect(component.submissionDocumentOptions.fileId).toBe('123');
  });

  it('should show error toast and not call update if fileNumber is missing on save', async () => {
    component.fileNumber = undefined;
    const toastSpy = jest.spyOn(mockToastService, 'showErrorToast');

    await component.saveOverview();

    expect(toastSpy).toHaveBeenCalledWith('Error loading file');
    expect(mockService.update).not.toHaveBeenCalled();
  });

  it('should call update, show success toast, and navigate on successful save', async () => {
    component.fileNumber = '456';
    component.overviewComponent = {
      $changes: { getValue: () => ({ foo: 'bar' }) },
    } as any;
    mockService.update.mockReturnValue(of({} as ComplianceAndEnforcementDto));
    const toastSpy = jest.spyOn(mockToastService, 'showSuccessToast');
    const navSpy = jest.spyOn(mockRouter, 'navigate');

    await component.saveOverview();

    expect(mockService.update).toHaveBeenCalledWith('456', { foo: 'bar' }, { idType: 'fileNumber' });
    expect(toastSpy).toHaveBeenCalledWith('Overview updated successfully');
    expect(navSpy).toHaveBeenCalled();
  });

  it('should catch error and not throw if update fails', async () => {
    component.fileNumber = '789';
    component.overviewComponent = {
      $changes: { getValue: () => ({}) },
    } as any;
    mockService.update.mockReturnValue({
      toPromise: () => Promise.reject(new Error('fail')),
      subscribe: (_: any, error: any) => error(new Error('fail')),
    } as any);
    jest.spyOn({ firstValueFrom }, 'firstValueFrom').mockImplementation(() => Promise.reject(new Error('fail')));

    await expect(component.saveOverview()).resolves.not.toThrow();
  });

  it('should complete $destroy on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component.$destroy, 'next');
    const completeSpy = jest.spyOn(component.$destroy, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
