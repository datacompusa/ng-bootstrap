import { Component, Directive, Input, Output, EventEmitter, ChangeDetectionStrategy, Inject, Injector, Renderer2, ElementRef, ViewContainerRef, ComponentFactoryResolver, NgZone, ViewEncapsulation, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { listenToTriggers } from '../util/triggers';
import { ngbAutoClose } from '../util/autoclose';
import { positionElements } from '../util/positioning';
import { PopupService } from '../util/popup';
import { NgbTooltipConfig } from './tooltip-config';
let nextId = 0;
export class NgbTooltipWindow {
}
NgbTooltipWindow.decorators = [
    { type: Component, args: [{
                selector: 'ngb-tooltip-window',
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                host: {
                    '[class]': '"tooltip" + (tooltipClass ? " " + tooltipClass : "")',
                    '[class.fade]': 'animation',
                    'role': 'tooltip',
                    '[id]': 'id'
                },
                template: `<div class="arrow"></div><div class="tooltip-inner"><ng-content></ng-content></div>`,
                styles: ["ngb-tooltip-window.bs-tooltip-bottom .arrow,ngb-tooltip-window.bs-tooltip-top .arrow{left:calc(50% - .4rem)}ngb-tooltip-window.bs-tooltip-bottom-left .arrow,ngb-tooltip-window.bs-tooltip-top-left .arrow{left:1em}ngb-tooltip-window.bs-tooltip-bottom-right .arrow,ngb-tooltip-window.bs-tooltip-top-right .arrow{left:auto;right:.8rem}ngb-tooltip-window.bs-tooltip-left .arrow,ngb-tooltip-window.bs-tooltip-right .arrow{top:calc(50% - .4rem)}ngb-tooltip-window.bs-tooltip-left-top .arrow,ngb-tooltip-window.bs-tooltip-right-top .arrow{top:.4rem}ngb-tooltip-window.bs-tooltip-left-bottom .arrow,ngb-tooltip-window.bs-tooltip-right-bottom .arrow{bottom:.4rem;top:auto}"]
            },] }
];
NgbTooltipWindow.propDecorators = {
    animation: [{ type: Input }],
    id: [{ type: Input }],
    tooltipClass: [{ type: Input }]
};
/**
 * A lightweight and extensible directive for fancy tooltip creation.
 */
export class NgbTooltip {
    constructor(_elementRef, _renderer, injector, componentFactoryResolver, viewContainerRef, config, _ngZone, _document, _changeDetector, applicationRef) {
        this._elementRef = _elementRef;
        this._renderer = _renderer;
        this._ngZone = _ngZone;
        this._document = _document;
        this._changeDetector = _changeDetector;
        /**
         * An event emitted when the tooltip opening animation has finished. Contains no payload.
         */
        this.shown = new EventEmitter();
        /**
         * An event emitted when the tooltip closing animation has finished. Contains no payload.
         */
        this.hidden = new EventEmitter();
        this._ngbTooltipWindowId = `ngb-tooltip-${nextId++}`;
        this._windowRef = null;
        this.animation = config.animation;
        this.autoClose = config.autoClose;
        this.placement = config.placement;
        this.triggers = config.triggers;
        this.container = config.container;
        this.disableTooltip = config.disableTooltip;
        this.tooltipClass = config.tooltipClass;
        this.openDelay = config.openDelay;
        this.closeDelay = config.closeDelay;
        this._popupService = new PopupService(NgbTooltipWindow, injector, viewContainerRef, _renderer, this._ngZone, componentFactoryResolver, applicationRef);
        this._zoneSubscription = _ngZone.onStable.subscribe(() => {
            if (this._windowRef) {
                positionElements(this._elementRef.nativeElement, this._windowRef.location.nativeElement, this.placement, this.container === 'body', 'bs-tooltip');
            }
        });
    }
    /**
     * The string content or a `TemplateRef` for the content to be displayed in the tooltip.
     *
     * If the content if falsy, the tooltip won't open.
     */
    set ngbTooltip(value) {
        this._ngbTooltip = value;
        if (!value && this._windowRef) {
            this.close();
        }
    }
    get ngbTooltip() { return this._ngbTooltip; }
    /**
     * Opens the tooltip.
     *
     * This is considered to be a "manual" triggering.
     * The `context` is an optional value to be injected into the tooltip template when it is created.
     */
    open(context) {
        if (!this._windowRef && this._ngbTooltip && !this.disableTooltip) {
            const { windowRef, transition$ } = this._popupService.open(this._ngbTooltip, context, this.animation);
            this._windowRef = windowRef;
            this._windowRef.instance.animation = this.animation;
            this._windowRef.instance.tooltipClass = this.tooltipClass;
            this._windowRef.instance.id = this._ngbTooltipWindowId;
            this._renderer.setAttribute(this._elementRef.nativeElement, 'aria-describedby', this._ngbTooltipWindowId);
            if (this.container === 'body') {
                this._document.querySelector(this.container).appendChild(this._windowRef.location.nativeElement);
            }
            // We need to detect changes, because we don't know where .open() might be called from.
            // Ex. opening tooltip from one of lifecycle hooks that run after the CD
            // (say from ngAfterViewInit) will result in 'ExpressionHasChanged' exception
            this._windowRef.changeDetectorRef.detectChanges();
            // We need to mark for check, because tooltip won't work inside the OnPush component.
            // Ex. when we use expression like `{{ tooltip.isOpen() : 'opened' : 'closed' }}`
            // inside the template of an OnPush component and we change the tooltip from
            // open -> closed, the expression in question won't be updated unless we explicitly
            // mark the parent component to be checked.
            this._windowRef.changeDetectorRef.markForCheck();
            ngbAutoClose(this._ngZone, this._document, this.autoClose, () => this.close(), this.hidden, [this._windowRef.location.nativeElement]);
            transition$.subscribe(() => this.shown.emit());
        }
    }
    /**
     * Closes the tooltip.
     *
     * This is considered to be a "manual" triggering of the tooltip.
     */
    close() {
        if (this._windowRef != null) {
            this._renderer.removeAttribute(this._elementRef.nativeElement, 'aria-describedby');
            this._popupService.close(this.animation).subscribe(() => {
                this._windowRef = null;
                this.hidden.emit();
                this._changeDetector.markForCheck();
            });
        }
    }
    /**
     * Toggles the tooltip.
     *
     * This is considered to be a "manual" triggering of the tooltip.
     */
    toggle() {
        if (this._windowRef) {
            this.close();
        }
        else {
            this.open();
        }
    }
    /**
     * Returns `true`, if the popover is currently shown.
     */
    isOpen() { return this._windowRef != null; }
    ngOnInit() {
        this._unregisterListenersFn = listenToTriggers(this._renderer, this._elementRef.nativeElement, this.triggers, this.isOpen.bind(this), this.open.bind(this), this.close.bind(this), +this.openDelay, +this.closeDelay);
    }
    ngOnChanges({ tooltipClass }) {
        if (tooltipClass && this.isOpen()) {
            this._windowRef.instance.tooltipClass = tooltipClass.currentValue;
        }
    }
    ngOnDestroy() {
        this.close();
        // This check is needed as it might happen that ngOnDestroy is called before ngOnInit
        // under certain conditions, see: https://github.com/ng-bootstrap/ng-bootstrap/issues/2199
        if (this._unregisterListenersFn) {
            this._unregisterListenersFn();
        }
        this._zoneSubscription.unsubscribe();
    }
}
NgbTooltip.decorators = [
    { type: Directive, args: [{ selector: '[ngbTooltip]', exportAs: 'ngbTooltip' },] }
];
NgbTooltip.ctorParameters = () => [
    { type: ElementRef },
    { type: Renderer2 },
    { type: Injector },
    { type: ComponentFactoryResolver },
    { type: ViewContainerRef },
    { type: NgbTooltipConfig },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: ChangeDetectorRef },
    { type: ApplicationRef }
];
NgbTooltip.propDecorators = {
    animation: [{ type: Input }],
    autoClose: [{ type: Input }],
    placement: [{ type: Input }],
    triggers: [{ type: Input }],
    container: [{ type: Input }],
    disableTooltip: [{ type: Input }],
    tooltipClass: [{ type: Input }],
    openDelay: [{ type: Input }],
    closeDelay: [{ type: Input }],
    shown: [{ type: Output }],
    hidden: [{ type: Output }],
    ngbTooltip: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvZ2FicmllbC9EZXZlbG9wbWVudC9uZy1ib290c3RyYXAvc3JjLyIsInNvdXJjZXMiOlsidG9vbHRpcC90b29sdGlwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLHVCQUF1QixFQUd2QixNQUFNLEVBQ04sUUFBUSxFQUNSLFNBQVMsRUFFVCxVQUFVLEVBRVYsZ0JBQWdCLEVBQ2hCLHdCQUF3QixFQUN4QixNQUFNLEVBQ04saUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQixjQUFjLEVBR2YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRXpDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUMvQyxPQUFPLEVBQUMsZ0JBQWdCLEVBQWlCLE1BQU0scUJBQXFCLENBQUM7QUFDckUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUUzQyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUVsRCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFlZixNQUFNLE9BQU8sZ0JBQWdCOzs7WUFiNUIsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxvQkFBb0I7Z0JBQzlCLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtnQkFDckMsSUFBSSxFQUFFO29CQUNKLFNBQVMsRUFBRSxzREFBc0Q7b0JBQ2pFLGNBQWMsRUFBRSxXQUFXO29CQUMzQixNQUFNLEVBQUUsU0FBUztvQkFDakIsTUFBTSxFQUFFLElBQUk7aUJBQ2I7Z0JBQ0QsUUFB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LElBQUksQ0FBQyxFQUMzRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVELFdBQVcsQ0FBQyxFQUFDLFlBQVksRUFBZ0I7UUFDdkMsSUFBSSxZQUFZLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2pDLElBQUksQ0FBQyxVQUFZLENBQUMsUUFBUSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDO1NBQ3JFO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDYixxRkFBcUY7UUFDckYsMEZBQTBGO1FBQzFGLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQy9CLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1NBQy9CO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7OztZQTNPRixTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUM7OztZQTVDM0QsVUFBVTtZQUZWLFNBQVM7WUFEVCxRQUFRO1lBTVIsd0JBQXdCO1lBRHhCLGdCQUFnQjtZQWdCVixnQkFBZ0I7WUFkdEIsTUFBTTs0Q0E4SXdCLE1BQU0sU0FBQyxRQUFRO1lBNUk3QyxpQkFBaUI7WUFDakIsY0FBYzs7O3dCQThDYixLQUFLO3dCQWFMLEtBQUs7d0JBZUwsS0FBSzt1QkFRTCxLQUFLO3dCQU9MLEtBQUs7NkJBT0wsS0FBSzsyQkFPTCxLQUFLO3dCQU9MLEtBQUs7eUJBT0wsS0FBSztvQkFLTCxNQUFNO3FCQUtOLE1BQU07eUJBeUNOLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIERpcmVjdGl2ZSxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgT25Jbml0LFxuICBPbkRlc3Ryb3ksXG4gIEluamVjdCxcbiAgSW5qZWN0b3IsXG4gIFJlbmRlcmVyMixcbiAgQ29tcG9uZW50UmVmLFxuICBFbGVtZW50UmVmLFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICBOZ1pvbmUsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQXBwbGljYXRpb25SZWYsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlc1xufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7bGlzdGVuVG9UcmlnZ2Vyc30gZnJvbSAnLi4vdXRpbC90cmlnZ2Vycyc7XG5pbXBvcnQge25nYkF1dG9DbG9zZX0gZnJvbSAnLi4vdXRpbC9hdXRvY2xvc2UnO1xuaW1wb3J0IHtwb3NpdGlvbkVsZW1lbnRzLCBQbGFjZW1lbnRBcnJheX0gZnJvbSAnLi4vdXRpbC9wb3NpdGlvbmluZyc7XG5pbXBvcnQge1BvcHVwU2VydmljZX0gZnJvbSAnLi4vdXRpbC9wb3B1cCc7XG5cbmltcG9ydCB7TmdiVG9vbHRpcENvbmZpZ30gZnJvbSAnLi90b29sdGlwLWNvbmZpZyc7XG5cbmxldCBuZXh0SWQgPSAwO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduZ2ItdG9vbHRpcC13aW5kb3cnLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgaG9zdDoge1xuICAgICdbY2xhc3NdJzogJ1widG9vbHRpcFwiICsgKHRvb2x0aXBDbGFzcyA/IFwiIFwiICsgdG9vbHRpcENsYXNzIDogXCJcIiknLFxuICAgICdbY2xhc3MuZmFkZV0nOiAnYW5pbWF0aW9uJyxcbiAgICAncm9sZSc6ICd0b29sdGlwJyxcbiAgICAnW2lkXSc6ICdpZCdcbiAgfSxcbiAgdGVtcGxhdGU6IGA8ZGl2IGNsYXNzPVwiYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwidG9vbHRpcC1pbm5lclwiPjxuZy1jb250ZW50PjwvbmctY29udGVudD48L2Rpdj5gLFxuICBzdHlsZVVybHM6IFsnLi90b29sdGlwLnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBOZ2JUb29sdGlwV2luZG93IHtcbiAgQElucHV0KCkgYW5pbWF0aW9uOiBib29sZWFuO1xuICBASW5wdXQoKSBpZDogc3RyaW5nO1xuICBASW5wdXQoKSB0b29sdGlwQ2xhc3M6IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIGxpZ2h0d2VpZ2h0IGFuZCBleHRlbnNpYmxlIGRpcmVjdGl2ZSBmb3IgZmFuY3kgdG9vbHRpcCBjcmVhdGlvbi5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdiVG9vbHRpcF0nLCBleHBvcnRBczogJ25nYlRvb2x0aXAnfSlcbmV4cG9ydCBjbGFzcyBOZ2JUb29sdGlwIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3ksIE9uQ2hhbmdlcyB7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hdXRvQ2xvc2U6IGJvb2xlYW4gfCBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIElmIGB0cnVlYCwgdG9vbHRpcCBvcGVuaW5nIGFuZCBjbG9zaW5nIHdpbGwgYmUgYW5pbWF0ZWQuXG4gICAqXG4gICAqIEBzaW5jZSA4LjAuMFxuICAgKi9cbiAgQElucHV0KCkgYW5pbWF0aW9uOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgdG9vbHRpcCBzaG91bGQgYmUgY2xvc2VkIG9uIGBFc2NhcGVgIGtleSBhbmQgaW5zaWRlL291dHNpZGUgY2xpY2tzOlxuICAgKlxuICAgKiAqIGB0cnVlYCAtIGNsb3NlcyBvbiBib3RoIG91dHNpZGUgYW5kIGluc2lkZSBjbGlja3MgYXMgd2VsbCBhcyBgRXNjYXBlYCBwcmVzc2VzXG4gICAqICogYGZhbHNlYCAtIGRpc2FibGVzIHRoZSBhdXRvQ2xvc2UgZmVhdHVyZSAoTkI6IHRyaWdnZXJzIHN0aWxsIGFwcGx5KVxuICAgKiAqIGBcImluc2lkZVwiYCAtIGNsb3NlcyBvbiBpbnNpZGUgY2xpY2tzIGFzIHdlbGwgYXMgRXNjYXBlIHByZXNzZXNcbiAgICogKiBgXCJvdXRzaWRlXCJgIC0gY2xvc2VzIG9uIG91dHNpZGUgY2xpY2tzIChzb21ldGltZXMgYWxzbyBhY2hpZXZhYmxlIHRocm91Z2ggdHJpZ2dlcnMpXG4gICAqIGFzIHdlbGwgYXMgYEVzY2FwZWAgcHJlc3Nlc1xuICAgKlxuICAgKiBAc2luY2UgMy4wLjBcbiAgICovXG4gIEBJbnB1dCgpIGF1dG9DbG9zZTogYm9vbGVhbiB8ICdpbnNpZGUnIHwgJ291dHNpZGUnO1xuXG4gIC8qKlxuICAgKiBUaGUgcHJlZmVycmVkIHBsYWNlbWVudCBvZiB0aGUgdG9vbHRpcC5cbiAgICpcbiAgICogUG9zc2libGUgdmFsdWVzIGFyZSBgXCJ0b3BcImAsIGBcInRvcC1sZWZ0XCJgLCBgXCJ0b3AtcmlnaHRcImAsIGBcImJvdHRvbVwiYCwgYFwiYm90dG9tLWxlZnRcImAsXG4gICAqIGBcImJvdHRvbS1yaWdodFwiYCwgYFwibGVmdFwiYCwgYFwibGVmdC10b3BcImAsIGBcImxlZnQtYm90dG9tXCJgLCBgXCJyaWdodFwiYCwgYFwicmlnaHQtdG9wXCJgLFxuICAgKiBgXCJyaWdodC1ib3R0b21cImBcbiAgICpcbiAgICogQWNjZXB0cyBhbiBhcnJheSBvZiBzdHJpbmdzIG9yIGEgc3RyaW5nIHdpdGggc3BhY2Ugc2VwYXJhdGVkIHBvc3NpYmxlIHZhbHVlcy5cbiAgICpcbiAgICogVGhlIGRlZmF1bHQgb3JkZXIgb2YgcHJlZmVyZW5jZSBpcyBgXCJhdXRvXCJgIChzYW1lIGFzIHRoZSBzZXF1ZW5jZSBhYm92ZSkuXG4gICAqXG4gICAqIFBsZWFzZSBzZWUgdGhlIFtwb3NpdGlvbmluZyBvdmVydmlld10oIy9wb3NpdGlvbmluZykgZm9yIG1vcmUgZGV0YWlscy5cbiAgICovXG4gIEBJbnB1dCgpIHBsYWNlbWVudDogUGxhY2VtZW50QXJyYXk7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBldmVudHMgdGhhdCBzaG91bGQgdHJpZ2dlciB0aGUgdG9vbHRpcC5cbiAgICpcbiAgICogU3VwcG9ydHMgYSBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBldmVudCBuYW1lcy5cbiAgICogRm9yIG1vcmUgZGV0YWlscyBzZWUgdGhlIFt0cmlnZ2VycyBkZW1vXSgjL2NvbXBvbmVudHMvdG9vbHRpcC9leGFtcGxlcyN0cmlnZ2VycykuXG4gICAqL1xuICBASW5wdXQoKSB0cmlnZ2Vyczogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIHNlbGVjdG9yIHNwZWNpZnlpbmcgdGhlIGVsZW1lbnQgdGhlIHRvb2x0aXAgc2hvdWxkIGJlIGFwcGVuZGVkIHRvLlxuICAgKlxuICAgKiBDdXJyZW50bHkgb25seSBzdXBwb3J0cyBgXCJib2R5XCJgLlxuICAgKi9cbiAgQElucHV0KCkgY29udGFpbmVyOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIElmIGB0cnVlYCwgdG9vbHRpcCBpcyBkaXNhYmxlZCBhbmQgd29uJ3QgYmUgZGlzcGxheWVkLlxuICAgKlxuICAgKiBAc2luY2UgMS4xLjBcbiAgICovXG4gIEBJbnB1dCgpIGRpc2FibGVUb29sdGlwOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBjbGFzcyBhcHBsaWVkIHRvIHRoZSB0b29sdGlwIHdpbmRvdyBlbGVtZW50LlxuICAgKlxuICAgKiBAc2luY2UgMy4yLjBcbiAgICovXG4gIEBJbnB1dCgpIHRvb2x0aXBDbGFzczogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgb3BlbmluZyBkZWxheSBpbiBtcy4gV29ya3Mgb25seSBmb3IgXCJub24tbWFudWFsXCIgb3BlbmluZyB0cmlnZ2VycyBkZWZpbmVkIGJ5IHRoZSBgdHJpZ2dlcnNgIGlucHV0LlxuICAgKlxuICAgKiBAc2luY2UgNC4xLjBcbiAgICovXG4gIEBJbnB1dCgpIG9wZW5EZWxheTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgY2xvc2luZyBkZWxheSBpbiBtcy4gV29ya3Mgb25seSBmb3IgXCJub24tbWFudWFsXCIgb3BlbmluZyB0cmlnZ2VycyBkZWZpbmVkIGJ5IHRoZSBgdHJpZ2dlcnNgIGlucHV0LlxuICAgKlxuICAgKiBAc2luY2UgNC4xLjBcbiAgICovXG4gIEBJbnB1dCgpIGNsb3NlRGVsYXk6IG51bWJlcjtcblxuICAvKipcbiAgICogQW4gZXZlbnQgZW1pdHRlZCB3aGVuIHRoZSB0b29sdGlwIG9wZW5pbmcgYW5pbWF0aW9uIGhhcyBmaW5pc2hlZC4gQ29udGFpbnMgbm8gcGF5bG9hZC5cbiAgICovXG4gIEBPdXRwdXQoKSBzaG93biA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKipcbiAgICogQW4gZXZlbnQgZW1pdHRlZCB3aGVuIHRoZSB0b29sdGlwIGNsb3NpbmcgYW5pbWF0aW9uIGhhcyBmaW5pc2hlZC4gQ29udGFpbnMgbm8gcGF5bG9hZC5cbiAgICovXG4gIEBPdXRwdXQoKSBoaWRkZW4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgcHJpdmF0ZSBfbmdiVG9vbHRpcDogc3RyaW5nIHwgVGVtcGxhdGVSZWY8YW55PnwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBfbmdiVG9vbHRpcFdpbmRvd0lkID0gYG5nYi10b29sdGlwLSR7bmV4dElkKyt9YDtcbiAgcHJpdmF0ZSBfcG9wdXBTZXJ2aWNlOiBQb3B1cFNlcnZpY2U8TmdiVG9vbHRpcFdpbmRvdz47XG4gIHByaXZhdGUgX3dpbmRvd1JlZjogQ29tcG9uZW50UmVmPE5nYlRvb2x0aXBXaW5kb3c+fCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfdW5yZWdpc3Rlckxpc3RlbmVyc0ZuO1xuICBwcml2YXRlIF96b25lU3Vic2NyaXB0aW9uOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiwgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMiwgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsIGNvbmZpZzogTmdiVG9vbHRpcENvbmZpZyxcbiAgICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLCBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIF9kb2N1bWVudDogYW55LCBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICBhcHBsaWNhdGlvblJlZjogQXBwbGljYXRpb25SZWYpIHtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IGNvbmZpZy5hbmltYXRpb247XG4gICAgdGhpcy5hdXRvQ2xvc2UgPSBjb25maWcuYXV0b0Nsb3NlO1xuICAgIHRoaXMucGxhY2VtZW50ID0gY29uZmlnLnBsYWNlbWVudDtcbiAgICB0aGlzLnRyaWdnZXJzID0gY29uZmlnLnRyaWdnZXJzO1xuICAgIHRoaXMuY29udGFpbmVyID0gY29uZmlnLmNvbnRhaW5lcjtcbiAgICB0aGlzLmRpc2FibGVUb29sdGlwID0gY29uZmlnLmRpc2FibGVUb29sdGlwO1xuICAgIHRoaXMudG9vbHRpcENsYXNzID0gY29uZmlnLnRvb2x0aXBDbGFzcztcbiAgICB0aGlzLm9wZW5EZWxheSA9IGNvbmZpZy5vcGVuRGVsYXk7XG4gICAgdGhpcy5jbG9zZURlbGF5ID0gY29uZmlnLmNsb3NlRGVsYXk7XG4gICAgdGhpcy5fcG9wdXBTZXJ2aWNlID0gbmV3IFBvcHVwU2VydmljZTxOZ2JUb29sdGlwV2luZG93PihcbiAgICAgICAgTmdiVG9vbHRpcFdpbmRvdywgaW5qZWN0b3IsIHZpZXdDb250YWluZXJSZWYsIF9yZW5kZXJlciwgdGhpcy5fbmdab25lLCBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgICAgIGFwcGxpY2F0aW9uUmVmKTtcblxuICAgIHRoaXMuX3pvbmVTdWJzY3JpcHRpb24gPSBfbmdab25lLm9uU3RhYmxlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fd2luZG93UmVmKSB7XG4gICAgICAgIHBvc2l0aW9uRWxlbWVudHMoXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMuX3dpbmRvd1JlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50LCB0aGlzLnBsYWNlbWVudCxcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID09PSAnYm9keScsICdicy10b29sdGlwJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHN0cmluZyBjb250ZW50IG9yIGEgYFRlbXBsYXRlUmVmYCBmb3IgdGhlIGNvbnRlbnQgdG8gYmUgZGlzcGxheWVkIGluIHRoZSB0b29sdGlwLlxuICAgKlxuICAgKiBJZiB0aGUgY29udGVudCBpZiBmYWxzeSwgdGhlIHRvb2x0aXAgd29uJ3Qgb3Blbi5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBuZ2JUb29sdGlwKHZhbHVlOiBzdHJpbmcgfCBUZW1wbGF0ZVJlZjxhbnk+fCBudWxsIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fbmdiVG9vbHRpcCA9IHZhbHVlO1xuICAgIGlmICghdmFsdWUgJiYgdGhpcy5fd2luZG93UmVmKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IG5nYlRvb2x0aXAoKSB7IHJldHVybiB0aGlzLl9uZ2JUb29sdGlwOyB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSB0b29sdGlwLlxuICAgKlxuICAgKiBUaGlzIGlzIGNvbnNpZGVyZWQgdG8gYmUgYSBcIm1hbnVhbFwiIHRyaWdnZXJpbmcuXG4gICAqIFRoZSBgY29udGV4dGAgaXMgYW4gb3B0aW9uYWwgdmFsdWUgdG8gYmUgaW5qZWN0ZWQgaW50byB0aGUgdG9vbHRpcCB0ZW1wbGF0ZSB3aGVuIGl0IGlzIGNyZWF0ZWQuXG4gICAqL1xuICBvcGVuKGNvbnRleHQ/OiBhbnkpIHtcbiAgICBpZiAoIXRoaXMuX3dpbmRvd1JlZiAmJiB0aGlzLl9uZ2JUb29sdGlwICYmICF0aGlzLmRpc2FibGVUb29sdGlwKSB7XG4gICAgICBjb25zdCB7d2luZG93UmVmLCB0cmFuc2l0aW9uJH0gPSB0aGlzLl9wb3B1cFNlcnZpY2Uub3Blbih0aGlzLl9uZ2JUb29sdGlwLCBjb250ZXh0LCB0aGlzLmFuaW1hdGlvbik7XG4gICAgICB0aGlzLl93aW5kb3dSZWYgPSB3aW5kb3dSZWY7XG4gICAgICB0aGlzLl93aW5kb3dSZWYuaW5zdGFuY2UuYW5pbWF0aW9uID0gdGhpcy5hbmltYXRpb247XG4gICAgICB0aGlzLl93aW5kb3dSZWYuaW5zdGFuY2UudG9vbHRpcENsYXNzID0gdGhpcy50b29sdGlwQ2xhc3M7XG4gICAgICB0aGlzLl93aW5kb3dSZWYuaW5zdGFuY2UuaWQgPSB0aGlzLl9uZ2JUb29sdGlwV2luZG93SWQ7XG5cbiAgICAgIHRoaXMuX3JlbmRlcmVyLnNldEF0dHJpYnV0ZSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICdhcmlhLWRlc2NyaWJlZGJ5JywgdGhpcy5fbmdiVG9vbHRpcFdpbmRvd0lkKTtcblxuICAgICAgaWYgKHRoaXMuY29udGFpbmVyID09PSAnYm9keScpIHtcbiAgICAgICAgdGhpcy5fZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLmNvbnRhaW5lcikuYXBwZW5kQ2hpbGQodGhpcy5fd2luZG93UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICAvLyBXZSBuZWVkIHRvIGRldGVjdCBjaGFuZ2VzLCBiZWNhdXNlIHdlIGRvbid0IGtub3cgd2hlcmUgLm9wZW4oKSBtaWdodCBiZSBjYWxsZWQgZnJvbS5cbiAgICAgIC8vIEV4LiBvcGVuaW5nIHRvb2x0aXAgZnJvbSBvbmUgb2YgbGlmZWN5Y2xlIGhvb2tzIHRoYXQgcnVuIGFmdGVyIHRoZSBDRFxuICAgICAgLy8gKHNheSBmcm9tIG5nQWZ0ZXJWaWV3SW5pdCkgd2lsbCByZXN1bHQgaW4gJ0V4cHJlc3Npb25IYXNDaGFuZ2VkJyBleGNlcHRpb25cbiAgICAgIHRoaXMuX3dpbmRvd1JlZi5jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG5cbiAgICAgIC8vIFdlIG5lZWQgdG8gbWFyayBmb3IgY2hlY2ssIGJlY2F1c2UgdG9vbHRpcCB3b24ndCB3b3JrIGluc2lkZSB0aGUgT25QdXNoIGNvbXBvbmVudC5cbiAgICAgIC8vIEV4LiB3aGVuIHdlIHVzZSBleHByZXNzaW9uIGxpa2UgYHt7IHRvb2x0aXAuaXNPcGVuKCkgOiAnb3BlbmVkJyA6ICdjbG9zZWQnIH19YFxuICAgICAgLy8gaW5zaWRlIHRoZSB0ZW1wbGF0ZSBvZiBhbiBPblB1c2ggY29tcG9uZW50IGFuZCB3ZSBjaGFuZ2UgdGhlIHRvb2x0aXAgZnJvbVxuICAgICAgLy8gb3BlbiAtPiBjbG9zZWQsIHRoZSBleHByZXNzaW9uIGluIHF1ZXN0aW9uIHdvbid0IGJlIHVwZGF0ZWQgdW5sZXNzIHdlIGV4cGxpY2l0bHlcbiAgICAgIC8vIG1hcmsgdGhlIHBhcmVudCBjb21wb25lbnQgdG8gYmUgY2hlY2tlZC5cbiAgICAgIHRoaXMuX3dpbmRvd1JlZi5jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcblxuICAgICAgbmdiQXV0b0Nsb3NlKFxuICAgICAgICAgIHRoaXMuX25nWm9uZSwgdGhpcy5fZG9jdW1lbnQsIHRoaXMuYXV0b0Nsb3NlLCAoKSA9PiB0aGlzLmNsb3NlKCksIHRoaXMuaGlkZGVuLFxuICAgICAgICAgIFt0aGlzLl93aW5kb3dSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudF0pO1xuXG4gICAgICB0cmFuc2l0aW9uJC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5zaG93bi5lbWl0KCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIHRvb2x0aXAuXG4gICAqXG4gICAqIFRoaXMgaXMgY29uc2lkZXJlZCB0byBiZSBhIFwibWFudWFsXCIgdHJpZ2dlcmluZyBvZiB0aGUgdG9vbHRpcC5cbiAgICovXG4gIGNsb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl93aW5kb3dSZWYgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlQXR0cmlidXRlKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ2FyaWEtZGVzY3JpYmVkYnknKTtcbiAgICAgIHRoaXMuX3BvcHVwU2VydmljZS5jbG9zZSh0aGlzLmFuaW1hdGlvbikuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5fd2luZG93UmVmID0gbnVsbDtcbiAgICAgICAgdGhpcy5oaWRkZW4uZW1pdCgpO1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSB0b29sdGlwLlxuICAgKlxuICAgKiBUaGlzIGlzIGNvbnNpZGVyZWQgdG8gYmUgYSBcIm1hbnVhbFwiIHRyaWdnZXJpbmcgb2YgdGhlIHRvb2x0aXAuXG4gICAqL1xuICB0b2dnbGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3dpbmRvd1JlZikge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wZW4oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAsIGlmIHRoZSBwb3BvdmVyIGlzIGN1cnJlbnRseSBzaG93bi5cbiAgICovXG4gIGlzT3BlbigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3dpbmRvd1JlZiAhPSBudWxsOyB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fdW5yZWdpc3Rlckxpc3RlbmVyc0ZuID0gbGlzdGVuVG9UcmlnZ2VycyhcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy50cmlnZ2VycywgdGhpcy5pc09wZW4uYmluZCh0aGlzKSwgdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAgIHRoaXMuY2xvc2UuYmluZCh0aGlzKSwgK3RoaXMub3BlbkRlbGF5LCArdGhpcy5jbG9zZURlbGF5KTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKHt0b29sdGlwQ2xhc3N9OiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKHRvb2x0aXBDbGFzcyAmJiB0aGlzLmlzT3BlbigpKSB7XG4gICAgICB0aGlzLl93aW5kb3dSZWYgIS5pbnN0YW5jZS50b29sdGlwQ2xhc3MgPSB0b29sdGlwQ2xhc3MuY3VycmVudFZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgICAvLyBUaGlzIGNoZWNrIGlzIG5lZWRlZCBhcyBpdCBtaWdodCBoYXBwZW4gdGhhdCBuZ09uRGVzdHJveSBpcyBjYWxsZWQgYmVmb3JlIG5nT25Jbml0XG4gICAgLy8gdW5kZXIgY2VydGFpbiBjb25kaXRpb25zLCBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwL2lzc3Vlcy8yMTk5XG4gICAgaWYgKHRoaXMuX3VucmVnaXN0ZXJMaXN0ZW5lcnNGbikge1xuICAgICAgdGhpcy5fdW5yZWdpc3Rlckxpc3RlbmVyc0ZuKCk7XG4gICAgfVxuICAgIHRoaXMuX3pvbmVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgfVxufVxuIl19