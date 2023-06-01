import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoRequestsComponent } from './info-requests.component';

describe('InfoRequestsComponent', () => {
  let component: InfoRequestsComponent;
  let fixture: ComponentFixture<InfoRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoRequestsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
