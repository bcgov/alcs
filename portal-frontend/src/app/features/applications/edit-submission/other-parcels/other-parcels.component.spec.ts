import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';

import { OtherParcelsComponent } from './other-parcels.component';
import { MatDialog } from '@angular/material/dialog';

describe('OtherParcelsComponent', () => {
  let component: OtherParcelsComponent;
  let fixture: ComponentFixture<OtherParcelsComponent>;
  let mockApplicationService: DeepMocked<ApplicationSubmissionService>;
  let applicationPipe = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);

  beforeEach(async () => {
    mockApplicationService = createMock();

    await TestBed.configureTestingModule({
      declarations: [OtherParcelsComponent],
      providers: [
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OtherParcelsComponent);
    component = fixture.componentInstance;
    component.$applicationSubmission = applicationPipe;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
