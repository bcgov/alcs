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

describe('DraftComponent', () => {
  let component: DraftComponent;
  let fixture: ComponentFixture<DraftComponent>;
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementService = createMock();
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

    expect(mockComplianceAndEnforcementService.fetchByFileNumber).toHaveBeenCalledWith('12345');
    expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('C&E file loaded');
  });

  it('shows error if loadFile fails', async () => {
    mockComplianceAndEnforcementService.fetchByFileNumber.mockRejectedValueOnce(new Error('fail'));
    await component.loadFile('12345');

    expect(mockComplianceAndEnforcementService.fetchByFileNumber).toHaveBeenCalledWith('12345');
    expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to load C&E file');
  });

  it('calls service update when onSaveDraftClicked is triggered', async () => {
    const changes: UpdateComplianceAndEnforcementDto = {};
    component.file = { uuid: '12345', fileNumber: '12345' } as ComplianceAndEnforcementDto;
    component.overviewComponent = { $changes: { getValue: () => changes } } as OverviewComponent;

    mockComplianceAndEnforcementService.update.mockReturnValue(
      of({
        uuid: '12345',
        fileNumber: '12345',
      } as ComplianceAndEnforcementDto),
    );

    await component.onSaveDraftClicked();

    expect(mockComplianceAndEnforcementService.update).toHaveBeenCalledWith('12345', changes);
  });

  it('unsubscribes on destroy', () => {
    const completeSpy = jest.spyOn(component['$destroy'], 'complete');

    component.ngOnDestroy();

    expect(completeSpy).toHaveBeenCalled();
  });
});
