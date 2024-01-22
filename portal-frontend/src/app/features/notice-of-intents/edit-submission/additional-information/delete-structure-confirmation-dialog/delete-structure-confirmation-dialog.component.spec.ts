import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { DeleteStructureConfirmationDialogComponent } from './delete-structure-confirmation-dialog.component';

describe('DeleteStructureConfirmationDialogComponent', () => {
  let component: DeleteStructureConfirmationDialogComponent;
  let fixture: ComponentFixture<DeleteStructureConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteStructureConfirmationDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteStructureConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
