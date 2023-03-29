import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { InlineBooleanComponent } from './inline-boolean.component';

describe('InlineBooleanComponent', () => {
  let component: InlineBooleanComponent;
  let fixture: ComponentFixture<InlineBooleanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, MatButtonToggleModule],
      declarations: [InlineBooleanComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineBooleanComponent);
    component = fixture.componentInstance;
    component.selectedValue = null;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
