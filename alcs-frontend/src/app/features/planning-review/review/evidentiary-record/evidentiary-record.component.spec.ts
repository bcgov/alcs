import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanningReviewDocumentService } from '../../../../services/planning-review/planning-review-document/planning-review-document.service';

import { EvidentiaryRecordComponent } from './evidentiary-record.component';

describe('EvidentiaryRecordComponent', () => {
  let component: EvidentiaryRecordComponent;
  let fixture: ComponentFixture<EvidentiaryRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: PlanningReviewDocumentService,
          useValue: {},
        },
      ],
      declarations: [EvidentiaryRecordComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EvidentiaryRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
