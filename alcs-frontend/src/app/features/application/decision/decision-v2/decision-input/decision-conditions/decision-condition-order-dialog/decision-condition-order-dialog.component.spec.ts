import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DecisionConditionOrderDialogComponent } from './decision-condition-order-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DecisionConditionOrderDialogComponent', () => {
  let component: DecisionConditionOrderDialogComponent;
  let fixture: ComponentFixture<DecisionConditionOrderDialogComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
    declarations: [DecisionConditionOrderDialogComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [MatDialogModule,
        BrowserAnimationsModule,
        MatTableModule,
        MatSortModule,
        RouterTestingModule],
    providers: [
        { provide: MAT_DIALOG_DATA, useValue: { conditions: [] } },
        { provide: MatDialogRef, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(DecisionConditionOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
