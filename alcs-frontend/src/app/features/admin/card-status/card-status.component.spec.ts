import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CardStatusService } from '../../../services/card/card-status/card-status.service';
import { ApplicationDecisionConditionTypesService } from '../../../services/application/application-decision-condition-types/application-decision-condition-types.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { CardStatusComponent } from './card-status.component';

describe('CardStatusComponent', () => {
  let component: CardStatusComponent;
  let fixture: ComponentFixture<CardStatusComponent>;
  let mockCardStatusService: DeepMocked<CardStatusService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;

  beforeEach(async () => {
    mockCardStatusService = createMock();
    mockDialog = createMock();
    mockConfirmationDialogService = createMock();

    await TestBed.configureTestingModule({
      declarations: [CardStatusComponent],
      providers: [
        {
          provide: CardStatusService,
          useValue: mockCardStatusService,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
        {
          provide: ConfirmationDialogService,
          useValue: mockConfirmationDialogService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CardStatusComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
