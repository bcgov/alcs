import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CeoCriterionService } from '../../../services/ceo-criterion/ceo-criterion.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { CeoCriterionComponent } from './ceo-criterion.component';

describe('CeoCriterionComponent', () => {
  let component: CeoCriterionComponent;
  let fixture: ComponentFixture<CeoCriterionComponent>;
  let mockCeoCriterionService: DeepMocked<CeoCriterionService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;

  beforeEach(async () => {
    mockCeoCriterionService = createMock();
    mockDialog = createMock();
    mockConfirmationDialogService = createMock();

    await TestBed.configureTestingModule({
      declarations: [CeoCriterionComponent],
      providers: [
        {
          provide: CeoCriterionService,
          useValue: mockCeoCriterionService,
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

    fixture = TestBed.createComponent(CeoCriterionComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
