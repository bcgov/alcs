import { ComplianceAndEnforcementComponent } from './compliance-and-enforcement.component';
import { ComplianceAndEnforcementService } from '../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import {
  AllegedActivity,
  ComplianceAndEnforcementDto,
  InitialSubmissionType,
} from '../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MatMenuModule } from '@angular/material/menu';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ComplianceAndEnforcementComponent', () => {
  let component: ComplianceAndEnforcementComponent;
  let fixture: ComponentFixture<ComplianceAndEnforcementComponent>;
  let mockService: DeepMocked<ComplianceAndEnforcementService>;
  let mockRoute: DeepMocked<ActivatedRoute>;

  beforeEach(async () => {
    mockService = createMock<ComplianceAndEnforcementService>();
    mockRoute = createMock<ActivatedRoute>();

    await TestBed.configureTestingModule({
      imports: [],
      declarations: [ComplianceAndEnforcementComponent],
      providers: [
        {
          provide: ComplianceAndEnforcementService,
          useValue: mockService,
        },
        {
          provide: ActivatedRoute,
          useValue: mockRoute,
        },
      ],
    });

    fixture = TestBed.createComponent(ComplianceAndEnforcementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call service.loadFile with correct arguments in loadFile()', async () => {
    await component.loadFile('456');
    expect(mockService.loadFile).toHaveBeenCalledWith('456', { withProperty: true });
  });

  it('should complete destroy subject on ngOnDestroy', () => {
    const destroyNext = jest.spyOn(component.destroy, 'next');
    const destroyComplete = jest.spyOn(component.destroy, 'complete');
    component.ngOnDestroy();
    expect(destroyNext).toHaveBeenCalled();
    expect(destroyComplete).toHaveBeenCalled();
  });
});
