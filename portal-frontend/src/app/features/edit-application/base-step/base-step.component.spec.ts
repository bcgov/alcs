import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseStepComponent } from './base-step.component';

describe('BaseStepComponent', () => {
  let component: BaseStepComponent;
  let fixture: ComponentFixture<BaseStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseStepComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
