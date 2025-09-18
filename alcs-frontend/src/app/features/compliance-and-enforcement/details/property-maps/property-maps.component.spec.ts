import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject, firstValueFrom, of, Subject } from 'rxjs';
import { ApplicationRegionDto } from '../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentService } from '../../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../../services/application/application.service';
import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComplianceAndEnforcementPropertyDto } from '../../../../services/compliance-and-enforcement/property/property.dto';
import { ComplianceAndEnforcementPropertyService } from '../../../../services/compliance-and-enforcement/property/property.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { PropertyMapsComponent } from './property-maps.component';

describe('PropertyMapsComponent', () => {
  let component: PropertyMapsComponent;
  let fixture: ComponentFixture<PropertyMapsComponent>;
  let mockActivatedRoute: DeepMocked<ActivatedRoute>;
  let mockRouter: DeepMocked<Router>;
  let mockService: DeepMocked<ComplianceAndEnforcementService>;
  let mockPropertyService: DeepMocked<ComplianceAndEnforcementPropertyService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockLocalGovernmentService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockActivatedRoute = createMock<ActivatedRoute>();
    mockRouter = createMock<Router>();
    mockService = createMock<ComplianceAndEnforcementService>();
    mockPropertyService = createMock<ComplianceAndEnforcementPropertyService>();
    mockToastService = createMock<ToastService>();
    mockLocalGovernmentService = createMock<ApplicationLocalGovernmentService>();
    mockApplicationService = createMock<ApplicationService>();
    mockApplicationService.$applicationRegions = new BehaviorSubject<ApplicationRegionDto[]>([]);

    TestBed.configureTestingModule({
      imports: [],
      declarations: [PropertyMapsComponent],
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
          provide: ComplianceAndEnforcementPropertyService,
          useValue: mockPropertyService,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockLocalGovernmentService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
      ],
    });

    fixture = TestBed.createComponent(PropertyMapsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set editing from route data on ngOnInit', () => {
    const dataSubject = new Subject<any>();
    mockActivatedRoute.data = dataSubject as any;
    component.ngOnInit();
    dataSubject.next({ editing: 'property' });
    expect(component.editing).toBe('property');
  });

  it('should set file, fileNumber, and mapsDocumentOptions.fileId from service.$file', () => {
    const fileSubject = new Subject<any>();
    mockService.$file = fileSubject as any;
    component.ngOnInit();
    const file = { fileNumber: '123' };

    fileSubject.next(file);

    expect(component.file).toBe(file);
    expect(component.fileNumber).toBe('123');
    expect(component.mapsDocumentOptions.fileId).toBe('123');
  });

  it('should show error toast and not call update if property uuid is missing on save', async () => {
    component.file = { property: undefined } as any;
    const toastSpy = jest.spyOn(mockToastService, 'showErrorToast');

    await component.saveProperty();

    expect(toastSpy).toHaveBeenCalledWith('Error loading property');
    expect(mockPropertyService.update).not.toHaveBeenCalled();
  });

  it('should call update, show success toast, and navigate on successful save', async () => {
    component.file = { property: { uuid: 'property-uuid' } } as any;
    component.propertyComponent = {
      $changes: { getValue: () => ({ foo: 'bar' }) },
    } as any;
    mockPropertyService.update.mockReturnValue(of({} as ComplianceAndEnforcementPropertyDto));
    const toastSpy = jest.spyOn(mockToastService, 'showSuccessToast');
    const navSpy = jest.spyOn(mockRouter, 'navigate');

    await component.saveProperty();

    expect(mockPropertyService.update).toHaveBeenCalledWith('property-uuid', { foo: 'bar' });
    expect(toastSpy).toHaveBeenCalledWith('Property updated successfully');
    expect(navSpy).toHaveBeenCalled();
  });

  it('should catch error and not throw if update fails', async () => {
    component.file = { property: { uuid: 'property-uuid' } } as any;
    component.propertyComponent = {
      $changes: { getValue: () => ({}) },
    } as any;
    mockPropertyService.update.mockReturnValue({
      toPromise: () => Promise.reject(new Error('fail')),
      subscribe: (_: any, error: any) => error(new Error('fail')),
    } as any);
    jest.spyOn({ firstValueFrom }, 'firstValueFrom').mockImplementation(() => Promise.reject(new Error('fail')));

    await expect(component.saveProperty()).resolves.not.toThrow();
  });

  it('should complete $destroy on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component.$destroy, 'next');
    const completeSpy = jest.spyOn(component.$destroy, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
