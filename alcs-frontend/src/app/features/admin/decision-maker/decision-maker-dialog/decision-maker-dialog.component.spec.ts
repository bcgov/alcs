import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionMakerService } from '../../../../services/application/application-decision-maker/application-decision-maker.service';

import { DecisionMakerDialogComponent } from './decision-maker-dialog.component';

describe('DecisionMakerDialogComponent', () => {
  let component: DecisionMakerDialogComponent;
  let fixture: ComponentFixture<DecisionMakerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [DecisionMakerDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: undefined },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: ApplicationDecisionMakerService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionMakerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
