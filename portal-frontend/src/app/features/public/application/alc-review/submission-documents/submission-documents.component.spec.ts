import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';

import { PublicSubmissionDocumentsComponent } from './submission-documents.component';

describe('PublicSubmissionDocumentsComponent', () => {
  let component: PublicSubmissionDocumentsComponent;
  let fixture: ComponentFixture<PublicSubmissionDocumentsComponent>;
  let mockPublicService: DeepMocked<PublicService>;

  beforeEach(async () => {
    mockPublicService = createMock();

    await TestBed.configureTestingModule({
      declarations: [PublicSubmissionDocumentsComponent],
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicSubmissionDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
