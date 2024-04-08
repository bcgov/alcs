import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { InquiryDetailService } from '../../../services/inquiry/inquiry-detail.service';
import { InquiryDto } from '../../../services/inquiry/inquiry.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { ParcelsComponent } from './parcels.component';

describe('ParcelsComponent', () => {
  let component: ParcelsComponent;
  let fixture: ComponentFixture<ParcelsComponent>;

  let inquiryDetailService: DeepMocked<InquiryDetailService>;
  let confirmationDialogService: DeepMocked<ConfirmationDialogService>;

  beforeEach(async () => {
    inquiryDetailService = createMock();
    confirmationDialogService = createMock();
    inquiryDetailService.$inquiry = new BehaviorSubject<InquiryDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: InquiryDetailService,
          useValue: inquiryDetailService,
        },
        {
          provide: ConfirmationDialogService,
          useValue: confirmationDialogService,
        },
      ],
      declarations: [ParcelsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
