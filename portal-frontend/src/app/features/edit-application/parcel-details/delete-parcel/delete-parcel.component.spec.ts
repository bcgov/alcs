import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteParcelComponent } from './delete-parcel.component';

describe('DeleteParcelComponent', () => {
  let component: DeleteParcelComponent;
  let fixture: ComponentFixture<DeleteParcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteParcelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteParcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
