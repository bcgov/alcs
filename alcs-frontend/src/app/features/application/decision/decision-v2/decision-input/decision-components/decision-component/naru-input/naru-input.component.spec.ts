import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NaruInputComponent } from './naru-input.component';

describe('NaruInputComponent', () => {
  let component: NaruInputComponent;
  let fixture: ComponentFixture<NaruInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NaruInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NaruInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
