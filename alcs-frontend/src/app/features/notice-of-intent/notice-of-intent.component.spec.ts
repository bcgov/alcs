import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationService } from '../../services/application/application.service';
import { NoticeOfIntentDetailService } from '../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../services/notice-of-intent/notice-of-intent.dto';

import { NoticeOfIntentComponent } from './notice-of-intent.component';

describe('NoticeOfIntentComponent', () => {
  let component: NoticeOfIntentComponent;
  let fixture: ComponentFixture<NoticeOfIntentComponent>;
  let mockNOIDetailService: DeepMocked<NoticeOfIntentDetailService>;

  beforeEach(async () => {
    mockNOIDetailService = createMock();
    mockNOIDetailService.$noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationService,
          useValue: {},
        },
        {
          provide: NoticeOfIntentDetailService,
          useValue: mockNOIDetailService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: new EventEmitter(),
          },
        },
        {
          provide: Router,
          useValue: {},
        },
      ],
      declarations: [NoticeOfIntentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticeOfIntentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
