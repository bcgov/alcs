import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../services/toast/toast.service';

import { ProposalComponent } from './proposal.component';

describe('ProposalComponent', () => {
  let component: ProposalComponent;
  let fixture: ComponentFixture<ProposalComponent>;
  let mockNoiDetailService: DeepMocked<NoticeOfIntentDetailService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockNoiDetailService = createMock();
    mockToastService = createMock();

    mockNoiDetailService.$noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [ ProposalComponent ],
      providers: [
        {
          provide: NoticeOfIntentDetailService,
          useValue: mockNoiDetailService,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
