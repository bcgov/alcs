import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurpInputComponent } from './turp-input.component';

describe('TurpInputComponent', () => {
  let component: TurpInputComponent;
  let fixture: ComponentFixture<TurpInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TurpInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurpInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
