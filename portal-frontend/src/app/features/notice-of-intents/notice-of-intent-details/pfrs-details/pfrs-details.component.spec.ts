import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';

import { PfrsDetailsComponent } from './pfrs-details.component';

describe('RosoDetailsComponent', () => {
  let component: PfrsDetailsComponent;
  let fixture: ComponentFixture<PfrsDetailsComponent>;
  let mockNoiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockNoiParcelService: DeepMocked<NoticeOfIntentParcelService>;

  beforeEach(async () => {
    mockNoiParcelService = createMock();
    mockNoiDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [PfrsDetailsComponent],
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

    fixture = TestBed.createComponent(PfrsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
