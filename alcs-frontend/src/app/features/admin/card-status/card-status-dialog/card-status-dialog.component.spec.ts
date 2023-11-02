import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CardStatusService } from '../../../../services/card/card-status/card-status.service';

import { CardStatusDialogComponent } from './card-status-dialog.component';

describe('CardStatusDialogComponent', () => {
  let component: CardStatusDialogComponent;
  let fixture: ComponentFixture<CardStatusDialogComponent>;
  let mockCardStatusService: DeepMocked<CardStatusService>;

  beforeEach(async () => {
    mockCardStatusService = createMock();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [CardStatusDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: undefined },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: CardStatusService,
          useValue: mockCardStatusService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CardStatusDialogComponent);
    component = fixture.componentInstance;

    mockCardStatusService.canDelete.mockResolvedValue({
      canDelete: false,
      reason: '',
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
