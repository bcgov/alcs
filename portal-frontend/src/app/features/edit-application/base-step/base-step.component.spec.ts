import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseStepComponent } from './base-step.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BaseStepComponent', () => {
  let component: BaseStepComponent;
  let fixture: ComponentFixture<BaseStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseStepComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
