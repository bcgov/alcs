import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvisionComponent } from './provision.component';

describe('ProvisionComponent', () => {
  let component: ProvisionComponent;
  let fixture: ComponentFixture<ProvisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProvisionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
