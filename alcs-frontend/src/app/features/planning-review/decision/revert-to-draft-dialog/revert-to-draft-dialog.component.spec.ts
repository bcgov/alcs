import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { RevertToDraftDialogComponent } from './revert-to-draft-dialog.component';

describe('RevertToDraftDialogComponent', () => {
  let component: RevertToDraftDialogComponent;
  let fixture: ComponentFixture<RevertToDraftDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RevertToDraftDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RevertToDraftDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
