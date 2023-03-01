import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomStepperComponent } from './custom-stepper.component';

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  }));

describe('CustomStepperComponent', () => {
  let component: CustomStepperComponent;
  let fixture: ComponentFixture<CustomStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomStepperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
