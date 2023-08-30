import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticeOfIntentSearchTableComponent } from './notice-of-intent-search-table.component';

describe('NoticeOfIntentSearchTableComponent', () => {
  let component: NoticeOfIntentSearchTableComponent;
  let fixture: ComponentFixture<NoticeOfIntentSearchTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoticeOfIntentSearchTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoticeOfIntentSearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
