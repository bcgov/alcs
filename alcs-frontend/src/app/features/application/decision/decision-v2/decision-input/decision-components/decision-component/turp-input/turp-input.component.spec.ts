import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurpInputComponent } from './turp-input.component';

describe('TurpInputComponent', () => {
  let component: TurpInputComponent;
  let fixture: ComponentFixture<TurpInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TurpInputComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TurpInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
