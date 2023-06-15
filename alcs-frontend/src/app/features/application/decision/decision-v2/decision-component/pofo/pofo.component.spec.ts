import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PofoComponent } from './pofo.component';

describe('PofoComponent', () => {
  let component: PofoComponent;
  let fixture: ComponentFixture<PofoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PofoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PofoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
