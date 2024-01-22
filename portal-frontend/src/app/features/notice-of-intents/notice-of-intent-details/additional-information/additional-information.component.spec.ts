import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';

import { AdditionalInformationComponent } from './additional-information.component';

describe('RosoAdditionalInformationComponent', () => {
  let component: AdditionalInformationComponent;
  let fixture: ComponentFixture<AdditionalInformationComponent>;
  let mockNoiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdditionalInformationComponent],
      providers: [
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocumentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
