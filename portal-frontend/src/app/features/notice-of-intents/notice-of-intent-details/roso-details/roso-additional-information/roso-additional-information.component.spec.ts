import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';

import { RosoAdditionalInformationComponent } from './roso-additional-information.component';

describe('RosoAdditionalInformationComponent', () => {
  let component: RosoAdditionalInformationComponent;
  let fixture: ComponentFixture<RosoAdditionalInformationComponent>;
  let mockNoiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RosoAdditionalInformationComponent],
      providers: [
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocumentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RosoAdditionalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
