import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationService } from '../../../services/application/application.service';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentService } from '../../../services/notice-of-intent/notice-of-intent.service';
import { PreparationComponent } from './preparation.component';

describe('IntakeComponent', () => {
  let component: PreparationComponent;
  let fixture: ComponentFixture<PreparationComponent>;
  let mockNOIDetailService: DeepMocked<NoticeOfIntentDetailService>;
  let mockNOIService: DeepMocked<NoticeOfIntentService>;

  beforeEach(async () => {
    mockNOIService = createMock();
    mockNOIDetailService = createMock();
    mockNOIDetailService.$noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        {
          provide: NoticeOfIntentDetailService,
          useValue: mockNOIDetailService,
        },
        {
          provide: ApplicationService,
          useValue: {
            createApplication: jest.fn(),
          },
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNOIService,
        },
      ],
      declarations: [PreparationComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PreparationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
