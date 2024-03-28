import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { InquiryDetailService } from '../../../services/inquiry/inquiry-detail.service';
import { InquiryDto } from '../../../services/inquiry/inquiry.dto';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let inquiryDetailService: DeepMocked<InquiryDetailService>;

  beforeEach(async () => {
    inquiryDetailService = createMock();
    inquiryDetailService.$inquiry = new BehaviorSubject<InquiryDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: InquiryDetailService,
          useValue: inquiryDetailService,
        },
      ],
      declarations: [OverviewComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
