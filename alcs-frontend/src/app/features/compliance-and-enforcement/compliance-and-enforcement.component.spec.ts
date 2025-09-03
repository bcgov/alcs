import { ComplianceAndEnforcementComponent } from './compliance-and-enforcement.component';
import { ComplianceAndEnforcementService } from '../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ActivatedRoute } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

describe('ComplianceAndEnforcementComponent', () => {
  let component: ComplianceAndEnforcementComponent;
  let fixture: ComponentFixture<ComplianceAndEnforcementComponent>;
  let mockService: DeepMocked<ComplianceAndEnforcementService>;
  let mockRoute: DeepMocked<ActivatedRoute>;
  let mockHttpClient: DeepMocked<HttpClient>;

  beforeEach(async () => {
    mockService = createMock<ComplianceAndEnforcementService>();
    mockRoute = createMock<ActivatedRoute>();
    mockHttpClient = createMock();

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
        {
          provide: HttpClient,
          useValue: mockHttpClient,
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
    expect(mockService.loadFile).toHaveBeenCalledWith('456', undefined);
  });

  it('should complete destroy subject on ngOnDestroy', () => {
    const destroyNext = jest.spyOn(component.$destroy, 'next');
    const destroyComplete = jest.spyOn(component.$destroy, 'complete');
    component.ngOnDestroy();
    expect(destroyNext).toHaveBeenCalled();
    expect(destroyComplete).toHaveBeenCalled();
  });
});
