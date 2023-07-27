import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExclProposalComponent } from './excl.component';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDto } from '../../../../services/application/application.dto';

describe('ExclProposalComponent', () => {
  let component: ExclProposalComponent;
  let fixture: ComponentFixture<ExclProposalComponent>;
  let mockApplicationDetailService: DeepMocked<ApplicationDetailService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockApplicationDetailService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ExclProposalComponent],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        {
          provide: ApplicationDetailService,
          useValue: mockApplicationDetailService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    mockApplicationDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    fixture = TestBed.createComponent(ExclProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
