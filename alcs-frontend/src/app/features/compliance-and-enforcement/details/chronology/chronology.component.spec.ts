import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplianceAndEnforcementChronologyComponent } from './chronology.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../services/toast/toast.service';
import { HttpClient } from '@angular/common/http';

describe('ComplianceAndEnforcementChronologyComponent', () => {
  let component: ComplianceAndEnforcementChronologyComponent;
  let fixture: ComponentFixture<ComplianceAndEnforcementChronologyComponent>;
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
      declarations: [ComplianceAndEnforcementChronologyComponent],
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

    fixture = TestBed.createComponent(ComplianceAndEnforcementChronologyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
