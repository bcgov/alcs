import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { SoilRemovalConfirmationDialogComponent } from './soil-removal-confirmation-dialog.component';

describe('SoilRemovalConfirmationDialogComponent', () => {
  let component: SoilRemovalConfirmationDialogComponent;
  let fixture: ComponentFixture<SoilRemovalConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SoilRemovalConfirmationDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SoilRemovalConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
