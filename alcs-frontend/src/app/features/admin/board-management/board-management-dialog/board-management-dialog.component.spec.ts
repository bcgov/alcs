import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AdminBoardManagementService } from '../../../../services/admin-board-management/admin-board-management.service';
import { CardStatusService } from '../../../../services/card/card-status/card-status.service';
import { SharedModule } from '../../../../shared/shared.module';

import { BoardManagementDialogComponent } from './board-management-dialog.component';

describe('BoardManagementDialogComponent', () => {
  let component: BoardManagementDialogComponent;
  let fixture: ComponentFixture<BoardManagementDialogComponent>;
  let mockCardStatusService: DeepMocked<CardStatusService>;
  let mockAdminBoardService: DeepMocked<AdminBoardManagementService>;
  let mockFormBuilder: DeepMocked<FormBuilder>;

  beforeEach(async () => {
    mockCardStatusService = createMock();
    mockAdminBoardService = createMock();
    mockFormBuilder = createMock();

    await TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [BoardManagementDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            cardTypes: [
              {
                code: 'CODE',
              },
            ],
          },
        },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: CardStatusService,
          useValue: mockCardStatusService,
        },
        {
          provide: AdminBoardManagementService,
          useValue: mockAdminBoardService,
        },
        {
          provide: FormBuilder,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardManagementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
