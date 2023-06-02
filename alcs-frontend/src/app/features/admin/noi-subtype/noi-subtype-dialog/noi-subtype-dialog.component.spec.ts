import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoiSubtypeService } from '../../../../services/noi-subtype/noi-subtype.service';

import { NoiSubtypeDialogComponent } from './noi-subtype-dialog.component';

describe('NoiSubtypeDialogComponent', () => {
  let component: NoiSubtypeDialogComponent;
  let fixture: ComponentFixture<NoiSubtypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [NoiSubtypeDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: undefined },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: NoiSubtypeService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NoiSubtypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
