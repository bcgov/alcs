import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubdInputComponent } from './subd-input.component';

describe('RosoInputComponent', () => {
  let component: SubdInputComponent;
  let fixture: ComponentFixture<SubdInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubdInputComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubdInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
