import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PofoInputComponent } from './pofo-input.component';

describe('PofoInputComponent', () => {
  let component: PofoInputComponent;
  let fixture: ComponentFixture<PofoInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PofoInputComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PofoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
