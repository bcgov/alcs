import { Directionality } from '@angular/cdk/bidi';
import { CdkStepper } from '@angular/cdk/stepper';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-custom-stepper',
  templateUrl: './custom-stepper.component.html',
  styleUrls: ['./custom-stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: CustomStepperComponent }],
})
export class CustomStepperComponent extends CdkStepper implements OnInit, OnDestroy {
  @Input()
  activeClass = 'active';

  @Output() beforeSwitchStep = new EventEmitter<number>();

  @ViewChild('stepsWrapper') stepper!: ElementRef;

  destroy = new Subject<void>();
  $width = new BehaviorSubject<number>(0);
  $resize!: ResizeObserver;

  constructor(
    _dir: Directionality,
    _changeDetectorRef: ChangeDetectorRef,
    _elementRef: ElementRef<HTMLElement>,
    private host: ElementRef,
    private zone: NgZone
  ) {
    super(_dir, _changeDetectorRef, _elementRef);
  }

  ngOnInit() {
    this.$resize = new ResizeObserver((entries) => {
      this.zone.run(() => {
        this.$width.next(entries[0].contentRect.width);
      });
    });

    // this is required for $resize to work properly
    setTimeout(() => this.$resize.observe(this.stepper.nativeElement));

    this.$width.pipe(takeUntil(this.destroy)).subscribe((val) => {
      this.setVisibilityForStepControls();
    });
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.$resize.unobserve(this.host.nativeElement);
    this.destroy.next();
    this.destroy.complete();
  }

  navigateToStep(index: number, forceSwitch: boolean = false) {
    if (!forceSwitch) {
      this.beforeSwitchStep.emit(index);
      return;
    }
    this.selectedIndex = index;
  }

  private getNarrowestElement(className: string) {
    const elements = document.getElementsByClassName(className);
    let minWidth = elements[0].clientWidth;
    for (let i = 1; i < elements.length; i++) {
      if (minWidth < elements[i].clientWidth) {
        minWidth = elements[i].clientWidth;
      }
    }

    return minWidth;
  }

  scrollLeft() {
    const scroll = this.getNarrowestElement('step-wrapper');
    this.stepper.nativeElement.scrollLeft -= scroll;
  }

  scrollRight() {
    const scroll = this.getNarrowestElement('step-wrapper');
    this.stepper.nativeElement.scrollLeft += scroll;
  }

  isElementBiggerThenParent(e: string): boolean {
    const el = document.getElementById(e);
    return el ? el.clientWidth < el.scrollWidth : false;
  }

  private setVisibilityForStepControls() {
    const isVisible = this.isElementBiggerThenParent('stepsWrapper');
    const elements = document.getElementsByClassName('stepper-controls');
    const hideClass = 'display-none';

    for (let i = 0; i < elements.length; i++) {
      if (isVisible) {
        elements[i].classList.remove(hideClass);
      } else {
        elements[i].classList.add(hideClass);
      }
    }
  }
}
