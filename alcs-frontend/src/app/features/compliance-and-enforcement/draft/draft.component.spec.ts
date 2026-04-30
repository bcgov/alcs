import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import {
  ComplianceAndEnforcementDto,
  UpdateComplianceAndEnforcementDto,
} from '../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService } from '../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import {
  ComplianceAndEnforcementPropertyDto,
  UpdateComplianceAndEnforcementPropertyDto,
} from '../../../services/compliance-and-enforcement/property/property.dto';
import { ComplianceAndEnforcementPropertyService } from '../../../services/compliance-and-enforcement/property/property.service';
import {
  ComplianceAndEnforcementSubmitterDto,
  UpdateComplianceAndEnforcementSubmitterDto,
} from '../../../services/compliance-and-enforcement/submitter/submitter.dto';
import { ComplianceAndEnforcementSubmitterService } from '../../../services/compliance-and-enforcement/submitter/submitter.service';
import { ToastService } from '../../../services/toast/toast.service';
import { StartOfDayPipe } from '../../../shared/pipes/startOfDay.pipe';
import { OverviewComponent } from '../overview/overview.component';
import { PropertyComponent } from '../property/property.component';
import { SubmitterComponent } from '../submitter/submitter.component';
import { DraftComponent } from './draft.component';

describe('DraftComponent', () => {
  let component: DraftComponent;
  let fixture: ComponentFixture<DraftComponent>;
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;
  let mockComplianceAndEnforcementSubmitterService: DeepMocked<ComplianceAndEnforcementSubmitterService>;
  let mockComplianceAndEnforcementPropertyService: DeepMocked<ComplianceAndEnforcementPropertyService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementService = createMock();
    mockComplianceAndEnforcementSubmitterService = createMock();
    mockComplianceAndEnforcementPropertyService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      declarations: [DraftComponent, StartOfDayPipe],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [],
      providers: [
        {
          provide: ComplianceAndEnforcementService,
          useValue: mockComplianceAndEnforcementService,
        },
        {
          provide: ComplianceAndEnforcementSubmitterService,
          useValue: mockComplianceAndEnforcementSubmitterService,
        },
        {
          provide: ComplianceAndEnforcementPropertyService,
          useValue: mockComplianceAndEnforcementPropertyService,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ fileNumber: '12345' }),
            },
          },
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DraftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads file on init', async () => {
    await component.loadFile('12345');

    expect(mockComplianceAndEnforcementService.fetchByFileNumber).toHaveBeenCalledWith('12345', {
      withSubmitters: true,
    });
  });

  it('shows error if loadFile fails', async () => {
    mockComplianceAndEnforcementService.fetchByFileNumber.mockRejectedValueOnce(new Error('fail'));
    await component.loadFile('12345');

    expect(mockComplianceAndEnforcementService.fetchByFileNumber).toHaveBeenCalledWith('12345', {
      withSubmitters: true,
    });
    expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to load C&E file');
  });

  it('calls service update when onSaveDraftClicked is triggered', async () => {
    const overviewChanges: UpdateComplianceAndEnforcementDto = {};
    const submitterChanges: UpdateComplianceAndEnforcementSubmitterDto = {};
    const propertyChanges: UpdateComplianceAndEnforcementPropertyDto = {};

    component.file = { uuid: '12345', fileNumber: '12345' } as ComplianceAndEnforcementDto;
    component.property = { uuid: '12345' } as ComplianceAndEnforcementPropertyDto;
    component.overviewComponent = { $changes: { getValue: () => overviewChanges } } as OverviewComponent;
    component.submitterComponent = { $changes: { getValue: () => ['12345', submitterChanges] } } as SubmitterComponent;
    component.propertyComponent = { $changes: { getValue: () => propertyChanges } } as PropertyComponent;

    mockComplianceAndEnforcementService.update.mockReturnValue(of({} as ComplianceAndEnforcementDto));
    mockComplianceAndEnforcementSubmitterService.update.mockReturnValue(of({} as ComplianceAndEnforcementSubmitterDto));
    mockComplianceAndEnforcementPropertyService.update.mockReturnValue(of({} as ComplianceAndEnforcementPropertyDto));

    await component.onSaveDraftClicked();

    expect(mockComplianceAndEnforcementService.update).toHaveBeenCalledWith('12345', overviewChanges);
    expect(mockComplianceAndEnforcementSubmitterService.update).toHaveBeenCalledWith('12345', submitterChanges);
    expect(mockComplianceAndEnforcementPropertyService.update).toHaveBeenCalledWith('12345', propertyChanges);
  });

  it('unsubscribes on destroy', () => {
    const completeSpy = jest.spyOn(component['$destroy'], 'complete');

    component.ngOnDestroy();

    expect(completeSpy).toHaveBeenCalled();
  });
});
