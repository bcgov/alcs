import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExclComponent } from './excl.component';

describe('ExclComponent', () => {
  let component: ExclComponent;
  let fixture: ComponentFixture<ExclComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExclComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExclComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
