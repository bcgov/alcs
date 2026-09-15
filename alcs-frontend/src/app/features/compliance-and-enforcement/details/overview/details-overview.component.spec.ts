import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { DetailsOverviewComponent } from './details-overview.component';

describe('DetailsOverviewComponent', () => {
  let component: DetailsOverviewComponent;
  let fixture: ComponentFixture<DetailsOverviewComponent>;
  let mockService: DeepMocked<ComplianceAndEnforcementService>;

  beforeEach(async () => {
    mockService = createMock<ComplianceAndEnforcementService>();

    await TestBed.configureTestingModule({
      imports: [],
      declarations: [DetailsOverviewComponent],
      providers: [
        {
          provide: ComplianceAndEnforcementService,
          useValue: mockService,
        },
      ],
    });

    fixture = TestBed.createComponent(DetailsOverviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isEditingStatus to true on startEditStatus', () => {
    component.isEditingStatus = false;
    component.startEditStatus();

    expect(component.isEditingStatus).toBe(true);
  });

  it('should set isEditingStatus to false on endEditStatus', () => {
    component.isEditingStatus = true;
    component.endEditStatus();

    expect(component.isEditingStatus).toBe(false);
  });

  it('should complete $destroy on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component.$destroy, 'next');
    const completeSpy = jest.spyOn(component.$destroy, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
