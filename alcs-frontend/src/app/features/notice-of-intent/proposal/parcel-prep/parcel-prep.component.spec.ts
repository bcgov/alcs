import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent/notice-of-intent-parcel/notice-of-intent-parcel.service';

import { ParcelPrepComponent } from './parcel-prep.component';

describe('ParcelPrepComponent', () => {
  let component: ParcelPrepComponent;
  let fixture: ComponentFixture<ParcelPrepComponent>;
  let mockNoiParcelService: DeepMocked<NoticeOfIntentParcelService>;

  beforeEach(async () => {
    mockNoiParcelService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ParcelPrepComponent],
      providers: [
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockNoiParcelService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelPrepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
