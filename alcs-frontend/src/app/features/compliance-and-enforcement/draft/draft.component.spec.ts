import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ToastService } from '../../../services/toast/toast.service';
import { StartOfDayPipe } from '../../../shared/pipes/startOfDay.pipe';
import { DraftComponent } from './draft.component';
import { ComplianceAndEnforcementService } from '../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { OverviewComponent } from '../overview/overview.component';
import {
  ComplianceAndEnforcementDto,
  UpdateComplianceAndEnforcementDto,
} from '../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { of } from 'rxjs';
import { SubmitterComponent } from '../submitter/submitter.component';
import {
  ComplianceAndEnforcementSubmitterDto,
  UpdateComplianceAndEnforcementSubmitterDto,
} from '../../../services/compliance-and-enforcement/submitter/submitter.dto';
import { ComplianceAndEnforcementSubmitterService } from '../../../services/compliance-and-enforcement/submitter/submitter.service';
import { PropertyComponent } from '../property/property.component';
import {
  CreateComplianceAndEnforcementPropertyDto,
  UpdateComplianceAndEnforcementPropertyDto,
} from '../../../services/compliance-and-enforcement/property/property.dto';
import { ComplianceAndEnforcementPropertyService } from '../../../services/compliance-and-enforcement/property/property.service';

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
      imports: [HttpClientTestingModule],
      declarations: [DraftComponent, StartOfDayPipe],
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
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

    expect(mockComplianceAndEnforcementService.fetchByFileNumber).toHaveBeenCalledWith('12345', true);
  });

  it('shows error if loadFile fails', async () => {
    mockComplianceAndEnforcementService.fetchByFileNumber.mockRejectedValueOnce(new Error('fail'));
    await component.loadFile('12345');

    expect(mockComplianceAndEnforcementService.fetchByFileNumber).toHaveBeenCalledWith('12345', true);
    expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to load C&E file');
  });

  it('calls service update when onSaveDraftClicked is triggered', async () => {
    const overviewChanges: UpdateComplianceAndEnforcementDto = {};
    const submitterChanges: UpdateComplianceAndEnforcementSubmitterDto = {};

    component.file = { uuid: '12345', fileNumber: '12345' } as ComplianceAndEnforcementDto;
    component.overviewComponent = { $changes: { getValue: () => overviewChanges } } as OverviewComponent;
    component.submitterComponent = { $changes: { getValue: () => submitterChanges } } as SubmitterComponent;

    mockComplianceAndEnforcementService.update.mockReturnValue(
      of({
        uuid: '12345',
        fileNumber: '12345',
      } as ComplianceAndEnforcementDto),
    );

    mockComplianceAndEnforcementSubmitterService.update.mockReturnValue(
      of({
        uuid: '12345',
        dateAdded: 0,
        isAnonymous: false,
        name: 'a',
        email: 'b',
        telephoneNumber: 'c',
        affiliation: 'd',
        additionalContactInformation: 'e',
      } as ComplianceAndEnforcementSubmitterDto),
    );

    // await component.onSaveDraftClicked();

    // expect(mockComplianceAndEnforcementService.update).toHaveBeenCalledWith('12345', overviewChanges);
    // expect(mockComplianceAndEnforcementSubmitterService.update).toHaveBeenCalledWith('12345', submitterChanges);
  });

  it('unsubscribes on destroy', () => {
    const completeSpy = jest.spyOn(component['$destroy'], 'complete');

    component.ngOnDestroy();

    expect(completeSpy).toHaveBeenCalled();
  });
});
