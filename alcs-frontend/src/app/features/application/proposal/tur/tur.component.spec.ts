import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { ToastService } from '../../../../services/toast/toast.service';

import { TurProposalComponent } from './tur.component';

describe('TurComponent', () => {
  let component: TurProposalComponent;
  let fixture: ComponentFixture<TurProposalComponent>;
  let mockApplicationDetailService: DeepMocked<ApplicationDetailService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockApplicationDetailService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      declarations: [TurProposalComponent],
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

    fixture = TestBed.createComponent(TurProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
