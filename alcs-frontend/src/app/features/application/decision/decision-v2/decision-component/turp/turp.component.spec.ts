import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurpComponent } from './turp.component';

describe('TurpComponent', () => {
  let component: TurpComponent;
  let fixture: ComponentFixture<TurpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TurpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
