import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfrsInputComponent } from './pfrs-input.component';

describe('PfrsInputComponent', () => {
  let component: PfrsInputComponent;
  let fixture: ComponentFixture<PfrsInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PfrsInputComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PfrsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
