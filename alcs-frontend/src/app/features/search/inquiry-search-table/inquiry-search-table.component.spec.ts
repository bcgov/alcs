import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquirySearchTableComponent } from './inquiry-search-table.component';

describe('InquirySearchTableComponent', () => {
  let component: InquirySearchTableComponent;
  let fixture: ComponentFixture<InquirySearchTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InquirySearchTableComponent]
    });
    fixture = TestBed.createComponent(InquirySearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
