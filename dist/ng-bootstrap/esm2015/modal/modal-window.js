import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, Input, NgZone, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { fromEvent, Subject, zip } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { getFocusableBoundaryElements } from '../util/focus-trap';
import { Key } from '../util/key';
import { ModalDismissReasons } from './modal-dismiss-reasons';
import { ngbRunTransition } from '../util/transition/ngbTransition';
export class NgbModalWindow {
    constructor(_document, _elRef, _zone) {
        this._document = _document;
        this._elRef = _elRef;
        this._zone = _zone;
        this._closed$ = new Subject();
        this._elWithFocus = null; // element that is focused prior to modal opening
        this.backdrop = true;
        this.keyboard = true;
        this.dismissEvent = new EventEmitter();
        this.shown = new Subject();
        this.hidden = new Subject();
    }
    dismiss(reason) { this.dismissEvent.emit(reason); }
    ngOnInit() { this._elWithFocus = this._document.activeElement; }
    ngAfterViewInit() { this._show(); }
    ngOnDestroy() { this._disableEventHandling(); }
    hide() {
        const { nativeElement } = this._elRef;
        const context = { animation: this.animation, runningTransition: 'stop' };
        const windowTransition$ = ngbRunTransition(nativeElement, () => nativeElement.classList.remove('show'), context);
        const dialogTransition$ = ngbRunTransition(this._dialogEl.nativeElement, () => { }, context);
        const transitions$ = zip(windowTransition$, dialogTransition$);
        transitions$.subscribe(() => {
            this.hidden.next();
            this.hidden.complete();
        });
        this._disableEventHandling();
        this._restoreFocus();
        return transitions$;
    }
    _show() {
        const { nativeElement } = this._elRef;
        const context = { animation: this.animation, runningTransition: 'continue' };
        const windowTransition$ = ngbRunTransition(nativeElement, () => nativeElement.classList.add('show'), context);
        const dialogTransition$ = ngbRunTransition(this._dialogEl.nativeElement, () => { }, context);
        zip(windowTransition$, dialogTransition$).subscribe(() => {
            this.shown.next();
            this.shown.complete();
        });
        this._enableEventHandling();
        this._setFocus();
    }
    _enableEventHandling() {
        const { nativeElement } = this._elRef;
        this._zone.runOutsideAngular(() => {
            fromEvent(nativeElement, 'keydown')
                .pipe(takeUntil(this._closed$), 
            // tslint:disable-next-line:deprecation
            filter(e => e.which === Key.Escape))
                .subscribe(event => {
                if (this.keyboard) {
                    requestAnimationFrame(() => {
                        if (!event.defaultPrevented) {
                            this._zone.run(() => this.dismiss(ModalDismissReasons.ESC));
                        }
                    });
                }
                else if (this.backdrop === 'static') {
                    this._bumpBackdrop();
                }
            });
            // We're listening to 'mousedown' and 'mouseup' to prevent modal from closing when pressing the mouse
            // inside the modal dialog and releasing it outside
            let preventClose = false;
            fromEvent(this._dialogEl.nativeElement, 'mousedown')
                .pipe(takeUntil(this._closed$), tap(() => preventClose = false), switchMap(() => fromEvent(nativeElement, 'mouseup').pipe(takeUntil(this._closed$), take(1))), filter(({ target }) => nativeElement === target))
                .subscribe(() => { preventClose = true; });
            // We're listening to 'click' to dismiss modal on modal window click, except when:
            // 1. clicking on modal dialog itself
            // 2. closing was prevented by mousedown/up handlers
            // 3. clicking on scrollbar when the viewport is too small and modal doesn't fit (click is not triggered at all)
            fromEvent(nativeElement, 'click').pipe(takeUntil(this._closed$)).subscribe(({ target }) => {
                if (nativeElement === target) {
                    if (this.backdrop === 'static') {
                        this._bumpBackdrop();
                    }
                    else if (this.backdrop === true && !preventClose) {
                        this._zone.run(() => this.dismiss(ModalDismissReasons.BACKDROP_CLICK));
                    }
                }
                preventClose = false;
            });
        });
    }
    _disableEventHandling() { this._closed$.next(); }
    _setFocus() {
        const { nativeElement } = this._elRef;
        if (!nativeElement.contains(document.activeElement)) {
            const autoFocusable = nativeElement.querySelector(`[ngbAutofocus]`);
            const firstFocusable = getFocusableBoundaryElements(nativeElement)[0];
            const elementToFocus = autoFocusable || firstFocusable || nativeElement;
            elementToFocus.focus();
        }
    }
    _restoreFocus() {
        const body = this._document.body;
        const elWithFocus = this._elWithFocus;
        let elementToFocus;
        if (elWithFocus && elWithFocus['focus'] && body.contains(elWithFocus)) {
            elementToFocus = elWithFocus;
        }
        else {
            elementToFocus = body;
        }
        this._zone.runOutsideAngular(() => {
            setTimeout(() => elementToFocus.focus());
            this._elWithFocus = null;
        });
    }
    _bumpBackdrop() {
        if (this.backdrop === 'static') {
            ngbRunTransition(this._elRef.nativeElement, ({ classList }) => {
                classList.add('modal-static');
                return () => classList.remove('modal-static');
            }, { animation: this.animation, runningTransition: 'continue' });
        }
    }
}
NgbModalWindow.decorators = [
    { type: Component, args: [{
                selector: 'ngb-modal-window',
                host: {
                    '[class]': '"modal d-block" + (windowClass ? " " + windowClass : "")',
                    '[class.fade]': 'animation',
                    'role': 'dialog',
                    'tabindex': '-1',
                    '[attr.aria-modal]': 'true',
                    '[attr.aria-labelledby]': 'ariaLabelledBy',
                    '[attr.aria-describedby]': 'ariaDescribedBy'
                },
                template: `
    <div #dialog [class]="'modal-dialog' + (size ? ' modal-' + size : '') + (centered ? ' modal-dialog-centered' : '') +
     (scrollable ? ' modal-dialog-scrollable' : '')" role="document">
        <div class="modal-content"><ng-content></ng-content></div>
    </div>
    `,
                encapsulation: ViewEncapsulation.None,
                styles: ["ngb-modal-window .component-host-scrollable{-ms-flex-direction:column;display:-ms-flexbox;display:flex;flex-direction:column;overflow:hidden}"]
            },] }
];
NgbModalWindow.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: ElementRef },
    { type: NgZone }
];
NgbModalWindow.propDecorators = {
    _dialogEl: [{ type: ViewChild, args: ['dialog', { static: true },] }],
    animation: [{ type: Input }],
    ariaLabelledBy: [{ type: Input }],
    ariaDescribedBy: [{ type: Input }],
    backdrop: [{ type: Input }],
    centered: [{ type: Input }],
    keyboard: [{ type: Input }],
    scrollable: [{ type: Input }],
    size: [{ type: Input }],
    windowClass: [{ type: Input }],
    dismissEvent: [{ type: Output, args: ['dismiss',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kYWwtd2luZG93LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9nYWJyaWVsL0RldmVsb3BtZW50L25nLWJvb3RzdHJhcC9zcmMvIiwic291cmNlcyI6WyJtb2RhbC9tb2RhbC13aW5kb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFFTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFHTixNQUFNLEVBQ04sU0FBUyxFQUNULGlCQUFpQixFQUNsQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsU0FBUyxFQUFjLE9BQU8sRUFBRSxHQUFHLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekQsT0FBTyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV2RSxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNoRSxPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ2hDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBQyxnQkFBZ0IsRUFBdUIsTUFBTSxrQ0FBa0MsQ0FBQztBQXNCeEYsTUFBTSxPQUFPLGNBQWM7SUFzQnpCLFlBQzhCLFNBQWMsRUFBVSxNQUErQixFQUFVLEtBQWE7UUFBOUUsY0FBUyxHQUFULFNBQVMsQ0FBSztRQUFVLFdBQU0sR0FBTixNQUFNLENBQXlCO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQXJCcEcsYUFBUSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFDL0IsaUJBQVksR0FBbUIsSUFBSSxDQUFDLENBQUUsaURBQWlEO1FBT3RGLGFBQVEsR0FBcUIsSUFBSSxDQUFDO1FBRWxDLGFBQVEsR0FB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RUFBRSxpQkFBaUIsRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO1NBQ2hFO0lBQ0gsQ0FBQzs7O1lBNUtGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QixJQUFJLEVBQUU7b0JBQ0osU0FBUyxFQUFFLDBEQUEwRDtvQkFDckUsY0FBYyxFQUFFLFdBQVc7b0JBQzNCLE1BQU0sRUFBRSxRQUFRO29CQUNoQixVQUFVLEVBQUUsSUFBSTtvQkFDaEIsbUJBQW1CLEVBQUUsTUFBTTtvQkFDM0Isd0JBQXdCLEVBQUUsZ0JBQWdCO29CQUMxQyx5QkFBeUIsRUFBRSxpQkFBaUI7aUJBQzdDO2dCQUNELFFBQVEsRUFBRTs7Ozs7S0FLUDtnQkFDSCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFFdEM7Ozs0Q0F3Qk0sTUFBTSxTQUFDLFFBQVE7WUEvRHBCLFVBQVU7WUFJVixNQUFNOzs7d0JBeUNMLFNBQVMsU0FBQyxRQUFRLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDO3dCQUVsQyxLQUFLOzZCQUNMLEtBQUs7OEJBQ0wsS0FBSzt1QkFDTCxLQUFLO3VCQUNMLEtBQUs7dUJBQ0wsS0FBSzt5QkFDTCxLQUFLO21CQUNMLEtBQUs7MEJBQ0wsS0FBSzsyQkFFTCxNQUFNLFNBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2Zyb21FdmVudCwgT2JzZXJ2YWJsZSwgU3ViamVjdCwgemlwfSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmlsdGVyLCBzd2l0Y2hNYXAsIHRha2UsIHRha2VVbnRpbCwgdGFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7Z2V0Rm9jdXNhYmxlQm91bmRhcnlFbGVtZW50c30gZnJvbSAnLi4vdXRpbC9mb2N1cy10cmFwJztcbmltcG9ydCB7S2V5fSBmcm9tICcuLi91dGlsL2tleSc7XG5pbXBvcnQge01vZGFsRGlzbWlzc1JlYXNvbnN9IGZyb20gJy4vbW9kYWwtZGlzbWlzcy1yZWFzb25zJztcbmltcG9ydCB7bmdiUnVuVHJhbnNpdGlvbiwgTmdiVHJhbnNpdGlvbk9wdGlvbnN9IGZyb20gJy4uL3V0aWwvdHJhbnNpdGlvbi9uZ2JUcmFuc2l0aW9uJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmdiLW1vZGFsLXdpbmRvdycsXG4gIGhvc3Q6IHtcbiAgICAnW2NsYXNzXSc6ICdcIm1vZGFsIGQtYmxvY2tcIiArICh3aW5kb3dDbGFzcyA/IFwiIFwiICsgd2luZG93Q2xhc3MgOiBcIlwiKScsXG4gICAgJ1tjbGFzcy5mYWRlXSc6ICdhbmltYXRpb24nLFxuICAgICdyb2xlJzogJ2RpYWxvZycsXG4gICAgJ3RhYmluZGV4JzogJy0xJyxcbiAgICAnW2F0dHIuYXJpYS1tb2RhbF0nOiAndHJ1ZScsXG4gICAgJ1thdHRyLmFyaWEtbGFiZWxsZWRieV0nOiAnYXJpYUxhYmVsbGVkQnknLFxuICAgICdbYXR0ci5hcmlhLWRlc2NyaWJlZGJ5XSc6ICdhcmlhRGVzY3JpYmVkQnknXG4gIH0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiAjZGlhbG9nIFtjbGFzc109XCInbW9kYWwtZGlhbG9nJyArIChzaXplID8gJyBtb2RhbC0nICsgc2l6ZSA6ICcnKSArIChjZW50ZXJlZCA/ICcgbW9kYWwtZGlhbG9nLWNlbnRlcmVkJyA6ICcnKSArXG4gICAgIChzY3JvbGxhYmxlID8gJyBtb2RhbC1kaWFsb2ctc2Nyb2xsYWJsZScgOiAnJylcIiByb2xlPVwiZG9jdW1lbnRcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj48bmctY29udGVudD48L25nLWNvbnRlbnQ+PC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgc3R5bGVVcmxzOiBbJy4vbW9kYWwuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIE5nYk1vZGFsV2luZG93IGltcGxlbWVudHMgT25Jbml0LFxuICAgIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2Nsb3NlZCQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICBwcml2YXRlIF9lbFdpdGhGb2N1czogRWxlbWVudCB8IG51bGwgPSBudWxsOyAgLy8gZWxlbWVudCB0aGF0IGlzIGZvY3VzZWQgcHJpb3IgdG8gbW9kYWwgb3BlbmluZ1xuXG4gIEBWaWV3Q2hpbGQoJ2RpYWxvZycsIHtzdGF0aWM6IHRydWV9KSBwcml2YXRlIF9kaWFsb2dFbDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD47XG5cbiAgQElucHV0KCkgYW5pbWF0aW9uOiBib29sZWFuO1xuICBASW5wdXQoKSBhcmlhTGFiZWxsZWRCeTogc3RyaW5nO1xuICBASW5wdXQoKSBhcmlhRGVzY3JpYmVkQnk6IHN0cmluZztcbiAgQElucHV0KCkgYmFja2Ryb3A6IGJvb2xlYW4gfCBzdHJpbmcgPSB0cnVlO1xuICBASW5wdXQoKSBjZW50ZXJlZDogc3RyaW5nO1xuICBASW5wdXQoKSBrZXlib2FyZCA9IHRydWU7XG4gIEBJbnB1dCgpIHNjcm9sbGFibGU6IHN0cmluZztcbiAgQElucHV0KCkgc2l6ZTogc3RyaW5nO1xuICBASW5wdXQoKSB3aW5kb3dDbGFzczogc3RyaW5nO1xuXG4gIEBPdXRwdXQoJ2Rpc21pc3MnKSBkaXNtaXNzRXZlbnQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgc2hvd24gPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICBoaWRkZW4gPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBfZG9jdW1lbnQ6IGFueSwgcHJpdmF0ZSBfZWxSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LCBwcml2YXRlIF96b25lOiBOZ1pvbmUpIHt9XG5cbiAgZGlzbWlzcyhyZWFzb24pOiB2b2lkIHsgdGhpcy5kaXNtaXNzRXZlbnQuZW1pdChyZWFzb24pOyB9XG5cbiAgbmdPbkluaXQoKSB7IHRoaXMuX2VsV2l0aEZvY3VzID0gdGhpcy5fZG9jdW1lbnQuYWN0aXZlRWxlbWVudDsgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHsgdGhpcy5fc2hvdygpOyB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7IHRoaXMuX2Rpc2FibGVFdmVudEhhbmRsaW5nKCk7IH1cblxuICBoaWRlKCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3Qge25hdGl2ZUVsZW1lbnR9ID0gdGhpcy5fZWxSZWY7XG4gICAgY29uc3QgY29udGV4dDogTmdiVHJhbnNpdGlvbk9wdGlvbnM8YW55PiA9IHthbmltYXRpb246IHRoaXMuYW5pbWF0aW9uLCBydW5uaW5nVHJhbnNpdGlvbjogJ3N0b3AnfTtcblxuICAgIGNvbnN0IHdpbmRvd1RyYW5zaXRpb24kID0gbmdiUnVuVHJhbnNpdGlvbihuYXRpdmVFbGVtZW50LCAoKSA9PiBuYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKSwgY29udGV4dCk7XG4gICAgY29uc3QgZGlhbG9nVHJhbnNpdGlvbiQgPSBuZ2JSdW5UcmFuc2l0aW9uKHRoaXMuX2RpYWxvZ0VsLm5hdGl2ZUVsZW1lbnQsICgpID0+IHt9LCBjb250ZXh0KTtcblxuICAgIGNvbnN0IHRyYW5zaXRpb25zJCA9IHppcCh3aW5kb3dUcmFuc2l0aW9uJCwgZGlhbG9nVHJhbnNpdGlvbiQpO1xuICAgIHRyYW5zaXRpb25zJC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5oaWRkZW4ubmV4dCgpO1xuICAgICAgdGhpcy5oaWRkZW4uY29tcGxldGUoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2Rpc2FibGVFdmVudEhhbmRsaW5nKCk7XG4gICAgdGhpcy5fcmVzdG9yZUZvY3VzKCk7XG5cbiAgICByZXR1cm4gdHJhbnNpdGlvbnMkO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2hvdygpIHtcbiAgICBjb25zdCB7bmF0aXZlRWxlbWVudH0gPSB0aGlzLl9lbFJlZjtcbiAgICBjb25zdCBjb250ZXh0OiBOZ2JUcmFuc2l0aW9uT3B0aW9uczxhbnk+ID0ge2FuaW1hdGlvbjogdGhpcy5hbmltYXRpb24sIHJ1bm5pbmdUcmFuc2l0aW9uOiAnY29udGludWUnfTtcblxuICAgIGNvbnN0IHdpbmRvd1RyYW5zaXRpb24kID0gbmdiUnVuVHJhbnNpdGlvbihuYXRpdmVFbGVtZW50LCAoKSA9PiBuYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKSwgY29udGV4dCk7XG4gICAgY29uc3QgZGlhbG9nVHJhbnNpdGlvbiQgPSBuZ2JSdW5UcmFuc2l0aW9uKHRoaXMuX2RpYWxvZ0VsLm5hdGl2ZUVsZW1lbnQsICgpID0+IHt9LCBjb250ZXh0KTtcblxuICAgIHppcCh3aW5kb3dUcmFuc2l0aW9uJCwgZGlhbG9nVHJhbnNpdGlvbiQpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLnNob3duLm5leHQoKTtcbiAgICAgIHRoaXMuc2hvd24uY29tcGxldGUoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2VuYWJsZUV2ZW50SGFuZGxpbmcoKTtcbiAgICB0aGlzLl9zZXRGb2N1cygpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW5hYmxlRXZlbnRIYW5kbGluZygpIHtcbiAgICBjb25zdCB7bmF0aXZlRWxlbWVudH0gPSB0aGlzLl9lbFJlZjtcbiAgICB0aGlzLl96b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIGZyb21FdmVudDxLZXlib2FyZEV2ZW50PihuYXRpdmVFbGVtZW50LCAna2V5ZG93bicpXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgIHRha2VVbnRpbCh0aGlzLl9jbG9zZWQkKSxcbiAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmRlcHJlY2F0aW9uXG4gICAgICAgICAgICAgIGZpbHRlcihlID0+IGUud2hpY2ggPT09IEtleS5Fc2NhcGUpKVxuICAgICAgICAgIC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMua2V5Ym9hcmQpIHtcbiAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUucnVuKCgpID0+IHRoaXMuZGlzbWlzcyhNb2RhbERpc21pc3NSZWFzb25zLkVTQykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYmFja2Ryb3AgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2J1bXBCYWNrZHJvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAvLyBXZSdyZSBsaXN0ZW5pbmcgdG8gJ21vdXNlZG93bicgYW5kICdtb3VzZXVwJyB0byBwcmV2ZW50IG1vZGFsIGZyb20gY2xvc2luZyB3aGVuIHByZXNzaW5nIHRoZSBtb3VzZVxuICAgICAgLy8gaW5zaWRlIHRoZSBtb2RhbCBkaWFsb2cgYW5kIHJlbGVhc2luZyBpdCBvdXRzaWRlXG4gICAgICBsZXQgcHJldmVudENsb3NlID0gZmFsc2U7XG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4odGhpcy5fZGlhbG9nRWwubmF0aXZlRWxlbWVudCwgJ21vdXNlZG93bicpXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgIHRha2VVbnRpbCh0aGlzLl9jbG9zZWQkKSwgdGFwKCgpID0+IHByZXZlbnRDbG9zZSA9IGZhbHNlKSxcbiAgICAgICAgICAgICAgc3dpdGNoTWFwKCgpID0+IGZyb21FdmVudDxNb3VzZUV2ZW50PihuYXRpdmVFbGVtZW50LCAnbW91c2V1cCcpLnBpcGUodGFrZVVudGlsKHRoaXMuX2Nsb3NlZCQpLCB0YWtlKDEpKSksXG4gICAgICAgICAgICAgIGZpbHRlcigoe3RhcmdldH0pID0+IG5hdGl2ZUVsZW1lbnQgPT09IHRhcmdldCkpXG4gICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7IHByZXZlbnRDbG9zZSA9IHRydWU7IH0pO1xuXG4gICAgICAvLyBXZSdyZSBsaXN0ZW5pbmcgdG8gJ2NsaWNrJyB0byBkaXNtaXNzIG1vZGFsIG9uIG1vZGFsIHdpbmRvdyBjbGljaywgZXhjZXB0IHdoZW46XG4gICAgICAvLyAxLiBjbGlja2luZyBvbiBtb2RhbCBkaWFsb2cgaXRzZWxmXG4gICAgICAvLyAyLiBjbG9zaW5nIHdhcyBwcmV2ZW50ZWQgYnkgbW91c2Vkb3duL3VwIGhhbmRsZXJzXG4gICAgICAvLyAzLiBjbGlja2luZyBvbiBzY3JvbGxiYXIgd2hlbiB0aGUgdmlld3BvcnQgaXMgdG9vIHNtYWxsIGFuZCBtb2RhbCBkb2Vzbid0IGZpdCAoY2xpY2sgaXMgbm90IHRyaWdnZXJlZCBhdCBhbGwpXG4gICAgICBmcm9tRXZlbnQ8TW91c2VFdmVudD4obmF0aXZlRWxlbWVudCwgJ2NsaWNrJykucGlwZSh0YWtlVW50aWwodGhpcy5fY2xvc2VkJCkpLnN1YnNjcmliZSgoe3RhcmdldH0pID0+IHtcbiAgICAgICAgaWYgKG5hdGl2ZUVsZW1lbnQgPT09IHRhcmdldCkge1xuICAgICAgICAgIGlmICh0aGlzLmJhY2tkcm9wID09PSAnc3RhdGljJykge1xuICAgICAgICAgICAgdGhpcy5fYnVtcEJhY2tkcm9wKCk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJhY2tkcm9wID09PSB0cnVlICYmICFwcmV2ZW50Q2xvc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX3pvbmUucnVuKCgpID0+IHRoaXMuZGlzbWlzcyhNb2RhbERpc21pc3NSZWFzb25zLkJBQ0tEUk9QX0NMSUNLKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJldmVudENsb3NlID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2Rpc2FibGVFdmVudEhhbmRsaW5nKCkgeyB0aGlzLl9jbG9zZWQkLm5leHQoKTsgfVxuXG4gIHByaXZhdGUgX3NldEZvY3VzKCkge1xuICAgIGNvbnN0IHtuYXRpdmVFbGVtZW50fSA9IHRoaXMuX2VsUmVmO1xuICAgIGlmICghbmF0aXZlRWxlbWVudC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSkge1xuICAgICAgY29uc3QgYXV0b0ZvY3VzYWJsZSA9IG5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcihgW25nYkF1dG9mb2N1c11gKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgIGNvbnN0IGZpcnN0Rm9jdXNhYmxlID0gZ2V0Rm9jdXNhYmxlQm91bmRhcnlFbGVtZW50cyhuYXRpdmVFbGVtZW50KVswXTtcblxuICAgICAgY29uc3QgZWxlbWVudFRvRm9jdXMgPSBhdXRvRm9jdXNhYmxlIHx8IGZpcnN0Rm9jdXNhYmxlIHx8IG5hdGl2ZUVsZW1lbnQ7XG4gICAgICBlbGVtZW50VG9Gb2N1cy5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Jlc3RvcmVGb2N1cygpIHtcbiAgICBjb25zdCBib2R5ID0gdGhpcy5fZG9jdW1lbnQuYm9keTtcbiAgICBjb25zdCBlbFdpdGhGb2N1cyA9IHRoaXMuX2VsV2l0aEZvY3VzO1xuXG4gICAgbGV0IGVsZW1lbnRUb0ZvY3VzO1xuICAgIGlmIChlbFdpdGhGb2N1cyAmJiBlbFdpdGhGb2N1c1snZm9jdXMnXSAmJiBib2R5LmNvbnRhaW5zKGVsV2l0aEZvY3VzKSkge1xuICAgICAgZWxlbWVudFRvRm9jdXMgPSBlbFdpdGhGb2N1cztcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudFRvRm9jdXMgPSBib2R5O1xuICAgIH1cbiAgICB0aGlzLl96b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gZWxlbWVudFRvRm9jdXMuZm9jdXMoKSk7XG4gICAgICB0aGlzLl9lbFdpdGhGb2N1cyA9IG51bGw7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9idW1wQmFja2Ryb3AoKSB7XG4gICAgaWYgKHRoaXMuYmFja2Ryb3AgPT09ICdzdGF0aWMnKSB7XG4gICAgICBuZ2JSdW5UcmFuc2l0aW9uKHRoaXMuX2VsUmVmLm5hdGl2ZUVsZW1lbnQsICh7Y2xhc3NMaXN0fSkgPT4ge1xuICAgICAgICBjbGFzc0xpc3QuYWRkKCdtb2RhbC1zdGF0aWMnKTtcbiAgICAgICAgcmV0dXJuICgpID0+IGNsYXNzTGlzdC5yZW1vdmUoJ21vZGFsLXN0YXRpYycpO1xuICAgICAgfSwge2FuaW1hdGlvbjogdGhpcy5hbmltYXRpb24sIHJ1bm5pbmdUcmFuc2l0aW9uOiAnY29udGludWUnfSk7XG4gICAgfVxuICB9XG59XG4iXX0=