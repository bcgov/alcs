import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoiDocumentService } from '../../../../../services/notice-of-intent/noi-document/noi-document.service';
import { NoticeOfIntentParcelService } from '../../../../../services/notice-of-intent/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { ParcelComponent } from './parcel.component';

describe('ParcelComponent', () => {
  let component: ParcelComponent;
  let fixture: ComponentFixture<ParcelComponent>;

  let mockNoiParcelService: DeepMocked<NoticeOfIntentParcelService>;
  let mockNoiDocService: DeepMocked<NoiDocumentService>;

  beforeEach(async () => {
    mockNoiParcelService = createMock();
    mockNoiDocService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ParcelComponent],
      providers: [
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockNoiParcelService,
        },

        {
          provide: NoiDocumentService,
          useValue: mockNoiDocService,
        },
        {
          provides: Router,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
