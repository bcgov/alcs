import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { NfuProposalComponent } from './nfu.component';

describe('NfuProposalComponent', () => {
  let component: NfuProposalComponent;
  let fixture: ComponentFixture<NfuProposalComponent>;
  let mockAppDetailService: DeepMocked<ApplicationDetailService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockAppDetailService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockAppDetailService,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
      declarations: [NfuProposalComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NfuProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
