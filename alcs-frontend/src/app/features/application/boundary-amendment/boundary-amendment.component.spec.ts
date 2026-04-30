import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationBoundaryAmendmentService } from '../../../services/application/application-boundary-amendments/application-boundary-amendment.service';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';

import { BoundaryAmendmentComponent } from './boundary-amendment.component';

describe('BoundaryAmendmentComponent', () => {
  let component: BoundaryAmendmentComponent;
  let fixture: ComponentFixture<BoundaryAmendmentComponent>;
  let mockAppDetailService: DeepMocked<ApplicationDetailService>;

  beforeEach(async () => {
    mockAppDetailService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockAppDetailService,
        },
        {
          provide: ApplicationBoundaryAmendmentService,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      declarations: [BoundaryAmendmentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BoundaryAmendmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
