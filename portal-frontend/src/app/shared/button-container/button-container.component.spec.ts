import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonContainerComponent } from './button-container.component';

describe('ButtonContainerComponent', () => {
  let component: ButtonContainerComponent;
  let fixture: ComponentFixture<ButtonContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ButtonContainerComponent]
    });
    fixture = TestBed.createComponent(ButtonContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
