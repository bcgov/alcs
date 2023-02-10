import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CeoCriterionService } from '../../../../services/ceo-criterion/ceo-criterion.service';

import { CeoCriterionDialogComponent } from './ceo-criterion-dialog.component';

describe('HolidayDialogComponent', () => {
  let component: CeoCriterionDialogComponent;
  let fixture: ComponentFixture<CeoCriterionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [CeoCriterionDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: CeoCriterionService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CeoCriterionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
