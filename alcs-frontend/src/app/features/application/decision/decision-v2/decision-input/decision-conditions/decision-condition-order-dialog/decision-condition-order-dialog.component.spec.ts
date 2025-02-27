import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DecisionConditionOrderDialogComponent } from './decision-condition-order-dialog.component';

describe('DecisionConditionOrderDialogComponent', () => {
  let component: DecisionConditionOrderDialogComponent;
  let fixture: ComponentFixture<DecisionConditionOrderDialogComponent>;
  let structuredClone: Function;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [DecisionConditionOrderDialogComponent],
      imports: [
        MatDialogModule,
        BrowserAnimationsModule,
        MatTableModule,
        MatSortModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { conditions: [] } },
        { provide: MatDialogRef, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionConditionOrderDialogComponent);
    component = fixture.componentInstance;
    structuredClone = jest.fn(val => {
      return JSON.parse(JSON.stringify(val));
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
