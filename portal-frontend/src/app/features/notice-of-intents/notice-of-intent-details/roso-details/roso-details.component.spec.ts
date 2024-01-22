import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';

import { RosoDetailsComponent } from './roso-details.component';

describe('RosoDetailsComponent', () => {
  let component: RosoDetailsComponent;
  let fixture: ComponentFixture<RosoDetailsComponent>;
  let mockNoiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockNoiParcelService: DeepMocked<NoticeOfIntentParcelService>;

  beforeEach(async () => {
    mockNoiParcelService = createMock();
    mockNoiDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [RosoDetailsComponent],
      providers: [
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocumentService,
        },
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockNoiParcelService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RosoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
