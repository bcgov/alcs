import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ToastService } from '../../../services/toast/toast.service';

import { ApplicantInfoComponent } from './applicant-info.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ApplicantInfoComponent', () => {
  let component: ApplicantInfoComponent;
  let fixture: ComponentFixture<ApplicantInfoComponent>;
  let mockAppDetailService: DeepMocked<ApplicationDetailService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockAppDetailService = createMock();
    mockAppDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ApplicantInfoComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [],
      providers: [
        { provide: ApplicationDetailService, useValue: mockAppDetailService },
        { provide: ToastService, useValue: mockToastService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
