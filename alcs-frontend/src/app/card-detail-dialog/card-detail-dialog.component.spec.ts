import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDetailDialogComponent } from './card-detail-dialog.component';

describe('CardDetailDialogComponent', () => {
  let component: CardDetailDialogComponent;
  let fixture: ComponentFixture<CardDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardDetailDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
