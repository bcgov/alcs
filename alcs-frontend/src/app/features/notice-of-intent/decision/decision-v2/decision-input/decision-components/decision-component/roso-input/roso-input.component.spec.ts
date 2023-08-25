import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RosoInputComponent } from './roso-input.component';

describe('RosoInputComponent', () => {
  let component: RosoInputComponent;
  let fixture: ComponentFixture<RosoInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RosoInputComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RosoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
