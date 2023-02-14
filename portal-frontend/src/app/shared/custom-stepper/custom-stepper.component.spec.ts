import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomStepperComponent } from './custom-stepper.component';

describe('CustomStepperComponent', () => {
  let component: CustomStepperComponent;
  let fixture: ComponentFixture<CustomStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomStepperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
