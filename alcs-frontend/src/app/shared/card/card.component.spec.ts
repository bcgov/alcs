import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent, CardType } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.cardData = {
      id: '1',
      status: '',
      type: {
        textColor: '#000',
        shortLabel: 'LUP',
        backgroundColor: '#fff',
        code: 'LUP',
        label: 'LUP',
        description: 'LUP',
      },
      title: 'Title',
      activeDays: 2,
      paused: false,
      highPriority: false,
      decisionMeetings: [],
      cardUuid: 'fake',
      cardType: CardType.APP,
      dateReceived: 11111,
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the number of active business days', () => {
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const activeDays = compiled.querySelector('.active-days');
    const textBlock = activeDays.querySelector('span');
    expect(textBlock.textContent).toContain('2');

    const pausedCard = compiled.querySelector('.paused');
    expect(pausedCard).toBeFalsy();
  });

  it('should apply the paused class to paused application', () => {
    component.cardData = {
      id: '1',
      status: '',
      type: {
        textColor: '#000',
        shortLabel: 'LUP',
        backgroundColor: '#fff',
        code: 'LUP',
        label: 'LUP',
        description: 'LUP',
      },
      title: 'Title',
      activeDays: 2,
      paused: true,
      highPriority: false,
      decisionMeetings: [],
      cardUuid: 'fake',
      cardType: CardType.APP,
      dateReceived: 11111,
    };
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const pausedCard = compiled.querySelector('.paused');
    expect(pausedCard).toBeTruthy();
  });
});
