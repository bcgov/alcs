import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NaruComponent } from './naru.component';

describe('NaruComponent', () => {
  let component: NaruComponent;
  let fixture: ComponentFixture<NaruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NaruComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NaruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
