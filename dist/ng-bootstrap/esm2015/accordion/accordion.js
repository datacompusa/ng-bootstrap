import { ChangeDetectorRef, Component, ContentChildren, Directive, ElementRef, EventEmitter, Host, Input, Optional, Output, TemplateRef, ViewEncapsulation, NgZone, } from '@angular/core';
import { isString } from '../util/util';
import { NgbAccordionConfig } from './accordion-config';
import { ngbRunTransition } from '../util/transition/ngbTransition';
import { ngbCollapsingTransition } from '../util/transition/ngbCollapseTransition';
import { take } from 'rxjs/operators';
let nextId = 0;
/**
 * A directive that wraps an accordion panel header with any HTML markup and a toggling button
 * marked with [`NgbPanelToggle`](#/components/accordion/api#NgbPanelToggle).
 * See the [header customization demo](#/components/accordion/examples#header) for more details.
 *
 * You can also use [`NgbPanelTitle`](#/components/accordion/api#NgbPanelTitle) to customize only the panel title.
 *
 * @since 4.1.0
 */
export class NgbPanelHeader {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
NgbPanelHeader.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[ngbPanelHeader]' },] }
];
NgbPanelHeader.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * A directive that wraps only the panel title with HTML markup inside.
 *
 * You can also use [`NgbPanelHeader`](#/components/accordion/api#NgbPanelHeader) to customize the full panel header.
 */
export class NgbPanelTitle {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
NgbPanelTitle.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[ngbPanelTitle]' },] }
];
NgbPanelTitle.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * A directive that wraps the accordion panel content.
 */
export class NgbPanelContent {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
NgbPanelContent.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[ngbPanelContent]' },] }
];
NgbPanelContent.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * A directive that wraps an individual accordion panel with title and collapsible content.
 */
export class NgbPanel {
    constructor() {
        /**
         *  If `true`, the panel is disabled an can't be toggled.
         */
        this.disabled = false;
        /**
         *  An optional id for the panel that must be unique on the page.
         *
         *  If not provided, it will be auto-generated in the `ngb-panel-xxx` format.
         */
        this.id = `ngb-panel-${nextId++}`;
        this.isOpen = false;
        /* A flag to specified that the transition panel classes have been initialized */
        this.initClassDone = false;
        /* A flag to specified if the panel is currently being animated, to ensure its presence in the dom */
        this.transitionRunning = false;
        /**
         * An event emitted when the panel is shown, after the transition. It has no payload.
         *
         * @since 8.0.0
         */
        this.shown = new EventEmitter();
        /**
         * An event emitted when the panel is hidden, after the transition. It has no payload.
         *
         * @since 8.0.0
         */
        this.hidden = new EventEmitter();
    }
    ngAfterContentChecked() {
        // We are using @ContentChildren instead of @ContentChild as in the Angular version being used
        // only @ContentChildren allows us to specify the {descendants: false} option.
        // Without {descendants: false} we are hitting bugs described in:
        // https://github.com/ng-bootstrap/ng-bootstrap/issues/2240
        this.titleTpl = this.titleTpls.first;
        this.headerTpl = this.headerTpls.first;
        this.contentTpl = this.contentTpls.first;
    }
}
NgbPanel.decorators = [
    { type: Directive, args: [{ selector: 'ngb-panel' },] }
];
NgbPanel.propDecorators = {
    disabled: [{ type: Input }],
    id: [{ type: Input }],
    title: [{ type: Input }],
    type: [{ type: Input }],
    cardClass: [{ type: Input }],
    shown: [{ type: Output }],
    hidden: [{ type: Output }],
    titleTpls: [{ type: ContentChildren, args: [NgbPanelTitle, { descendants: false },] }],
    headerTpls: [{ type: ContentChildren, args: [NgbPanelHeader, { descendants: false },] }],
    contentTpls: [{ type: ContentChildren, args: [NgbPanelContent, { descendants: false },] }]
};
/**
 * Accordion is a collection of collapsible panels (bootstrap cards).
 *
 * It can ensure only one panel is opened at a time and allows to customize panel
 * headers.
 */
export class NgbAccordion {
    constructor(config, _element, _ngZone, _changeDetector) {
        this._element = _element;
        this._ngZone = _ngZone;
        this._changeDetector = _changeDetector;
        /**
         * An array or comma separated strings of panel ids that should be opened **initially**.
         *
         * For subsequent changes use methods like `expand()`, `collapse()`, etc. and
         * the `(panelChange)` event.
         */
        this.activeIds = [];
        /**
         * If `true`, panel content will be detached from DOM and not simply hidden when the panel is collapsed.
         */
        this.destroyOnHide = true;
        /**
         * Event emitted right before the panel toggle happens.
         *
         * See [NgbPanelChangeEvent](#/components/accordion/api#NgbPanelChangeEvent) for payload details.
         */
        this.panelChange = new EventEmitter();
        /**
         * An event emitted when the expanding animation is finished on the panel. The payload is the panel id.
         *
         * @since 8.0.0
         */
        this.shown = new EventEmitter();
        /**
         * An event emitted when the collapsing animation is finished on the panel, and before the panel element is removed.
         * The payload is the panel id.
         *
         * @since 8.0.0
         */
        this.hidden = new EventEmitter();
        this.animation = config.animation;
        this.type = config.type;
        this.closeOtherPanels = config.closeOthers;
    }
    /**
     * Checks if a panel with a given id is expanded.
     */
    isExpanded(panelId) { return this.activeIds.indexOf(panelId) > -1; }
    /**
     * Expands a panel with a given id.
     *
     * Has no effect if the panel is already expanded or disabled.
     */
    expand(panelId) { this._changeOpenState(this._findPanelById(panelId), true); }
    /**
     * Expands all panels, if `[closeOthers]` is `false`.
     *
     * If `[closeOthers]` is `true`, it will expand the first panel, unless there is already a panel opened.
     */
    expandAll() {
        if (this.closeOtherPanels) {
            if (this.activeIds.length === 0 && this.panels.length) {
                this._changeOpenState(this.panels.first, true);
            }
        }
        else {
            this.panels.forEach(panel => this._changeOpenState(panel, true));
        }
    }
    /**
     * Collapses a panel with the given id.
     *
     * Has no effect if the panel is already collapsed or disabled.
     */
    collapse(panelId) { this._changeOpenState(this._findPanelById(panelId), false); }
    /**
     * Collapses all opened panels.
     */
    collapseAll() {
        this.panels.forEach((panel) => { this._changeOpenState(panel, false); });
    }
    /**
     * Toggles a panel with the given id.
     *
     * Has no effect if the panel is disabled.
     */
    toggle(panelId) {
        const panel = this._findPanelById(panelId);
        if (panel) {
            this._changeOpenState(panel, !panel.isOpen);
        }
    }
    ngAfterContentChecked() {
        // active id updates
        if (isString(this.activeIds)) {
            this.activeIds = this.activeIds.split(/\s*,\s*/);
        }
        // update panels open states
        this.panels.forEach(panel => { panel.isOpen = !panel.disabled && this.activeIds.indexOf(panel.id) > -1; });
        // closeOthers updates
        if (this.activeIds.length > 1 && this.closeOtherPanels) {
            this._closeOthers(this.activeIds[0], false);
            this._updateActiveIds();
        }
        // Setup the initial classes here
        this._ngZone.onStable.pipe(take(1)).subscribe(() => {
            this.panels.forEach(panel => {
                const panelElement = this._getPanelElement(panel.id);
                if (panelElement) {
                    if (!panel.initClassDone) {
                        panel.initClassDone = true;
                        const { classList } = panelElement;
                        classList.add('collapse');
                        if (panel.isOpen) {
                            classList.add('show');
                        }
                    }
                }
                else {
                    // Classes must be initialized next time it will be in the dom
                    panel.initClassDone = false;
                }
            });
        });
    }
    _changeOpenState(panel, nextState) {
        if (panel != null && !panel.disabled && panel.isOpen !== nextState) {
            let defaultPrevented = false;
            this.panelChange.emit({ panelId: panel.id, nextState: nextState, preventDefault: () => { defaultPrevented = true; } });
            if (!defaultPrevented) {
                panel.isOpen = nextState;
                panel.transitionRunning = true;
                if (nextState && this.closeOtherPanels) {
                    this._closeOthers(panel.id);
                }
                this._updateActiveIds();
                this._runTransitions(this.animation);
            }
        }
    }
    _closeOthers(panelId, enableTransition = true) {
        this.panels.forEach(panel => {
            if (panel.id !== panelId && panel.isOpen) {
                panel.isOpen = false;
                panel.transitionRunning = enableTransition;
            }
        });
    }
    _findPanelById(panelId) { return this.panels.find(p => p.id === panelId) || null; }
    _updateActiveIds() {
        this.activeIds = this.panels.filter(panel => panel.isOpen && !panel.disabled).map(panel => panel.id);
    }
    _runTransitions(animation, emitEvent = true) {
        // detectChanges is performed to ensure that all panels are in the dom (via transitionRunning = true)
        // before starting the animation
        this._changeDetector.detectChanges();
        this.panels.forEach(panel => {
            // When panel.transitionRunning is true, the transition needs to be started OR reversed,
            // The direction (show or hide) is choosen by each panel.isOpen state
            if (panel.transitionRunning) {
                const panelElement = this._getPanelElement(panel.id);
                ngbRunTransition(panelElement, ngbCollapsingTransition, {
                    animation,
                    runningTransition: 'stop',
                    context: { direction: panel.isOpen ? 'show' : 'hide' }
                }).subscribe(() => {
                    panel.transitionRunning = false;
                    if (emitEvent) {
                        const { id } = panel;
                        if (panel.isOpen) {
                            panel.shown.emit();
                            this.shown.emit(id);
                        }
                        else {
                            panel.hidden.emit();
                            this.hidden.emit(id);
                        }
                    }
                });
            }
        });
    }
    _getPanelElement(panelId) {
        return this._element.nativeElement.querySelector('#' + panelId);
    }
}
NgbAccordion.decorators = [
    { type: Component, args: [{
                selector: 'ngb-accordion',
                exportAs: 'ngbAccordion',
                encapsulation: ViewEncapsulation.None,
                host: { 'class': 'accordion', 'role': 'tablist', '[attr.aria-multiselectable]': '!closeOtherPanels' },
                template: `
    <ng-template #t ngbPanelHeader let-panel>
      <button class="btn btn-link" [ngbPanelToggle]="panel">
        {{panel.title}}<ng-template [ngTemplateOutlet]="panel.titleTpl?.templateRef"></ng-template>
      </button>
    </ng-template>
    <ng-template ngFor let-panel [ngForOf]="panels">
      <div [class]="'card ' + (panel.cardClass || '')">
        <div role="tab" id="{{panel.id}}-header" [class]="'card-header ' + (panel.type ? 'bg-'+panel.type: type ? 'bg-'+type : '')">
          <ng-template [ngTemplateOutlet]="panel.headerTpl?.templateRef || t"
                       [ngTemplateOutletContext]="{$implicit: panel, opened: panel.isOpen}"></ng-template>
        </div>
        <div id="{{panel.id}}" role="tabpanel" [attr.aria-labelledby]="panel.id + '-header'"
             *ngIf="!destroyOnHide || panel.isOpen || panel.transitionRunning">
          <div class="card-body">
               <ng-template [ngTemplateOutlet]="panel.contentTpl?.templateRef || null"></ng-template>
          </div>
        </div>
      </div>
    </ng-template>
  `
            },] }
];
NgbAccordion.ctorParameters = () => [
    { type: NgbAccordionConfig },
    { type: ElementRef },
    { type: NgZone },
    { type: ChangeDetectorRef }
];
NgbAccordion.propDecorators = {
    panels: [{ type: ContentChildren, args: [NgbPanel,] }],
    animation: [{ type: Input }],
    activeIds: [{ type: Input }],
    closeOtherPanels: [{ type: Input, args: ['closeOthers',] }],
    destroyOnHide: [{ type: Input }],
    type: [{ type: Input }],
    panelChange: [{ type: Output }],
    shown: [{ type: Output }],
    hidden: [{ type: Output }]
};
/**
 * A directive to put on a button that toggles panel opening and closing.
 *
 * To be used inside the [`NgbPanelHeader`](#/components/accordion/api#NgbPanelHeader)
 *
 * @since 4.1.0
 */
export class NgbPanelToggle {
    constructor(accordion, panel) {
        this.accordion = accordion;
        this.panel = panel;
    }
    set ngbPanelToggle(panel) {
        if (panel) {
            this.panel = panel;
        }
    }
}
NgbPanelToggle.decorators = [
    { type: Directive, args: [{
                selector: 'button[ngbPanelToggle]',
                host: {
                    'type': 'button',
                    '[disabled]': 'panel.disabled',
                    '[class.collapsed]': '!panel.isOpen',
                    '[attr.aria-expanded]': 'panel.isOpen',
                    '[attr.aria-controls]': 'panel.id',
                    '(click)': 'accordion.toggle(panel.id)'
                }
            },] }
];
NgbPanelToggle.ctorParameters = () => [
    { type: NgbAccordion },
    { type: NgbPanel, decorators: [{ type: Optional }, { type: Host }] }
];
NgbPanelToggle.propDecorators = {
    ngbPanelToggle: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9nYWJyaWVsL0RldmVsb3BtZW50L25nLWJvb3RzdHJhcC9zcmMvIiwic291cmNlcyI6WyJhY2NvcmRpb24vYWNjb3JkaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFTCxpQkFBaUIsRUFDakIsU0FBUyxFQUNULGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixJQUFJLEVBQ0osS0FBSyxFQUNMLFFBQVEsRUFDUixNQUFNLEVBRU4sV0FBVyxFQUNYLGlCQUFpQixFQUNqQixNQUFNLEdBQ1AsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUV0QyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUNsRSxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQztBQUNqRixPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBY2Y7Ozs7Ozs7O0dBUUc7QUFFSCxNQUFNLE9BQU8sY0FBYztJQUN6QixZQUFtQixXQUE2QjtRQUE3QixnQkFBVyxHQUFYLFdBQVcsQ0FBa0I7SUFBRyxDQUFDOzs7WUFGckQsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLDZCQUE2QixFQUFDOzs7WUFuQ2xELFdBQVc7O0FBd0NiOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sYUFBYTtJQUN4QixZQUFtQixXQUE2QjtRQUE3QixnQkFBVyxHQUFYLFdBQVcsQ0FBa0I7SUFBRyxDQUFDOzs7WUFGckQsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLDRCQUE0QixFQUFDOzs7WUE3Q2pELFdBQVc7O0FBa0RiOztHQUVHO0FBRUgsTUFBTSxPQUFP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O3dCQU94QixLQUFLO3dCQVFMLEtBQUs7K0JBT0wsS0FBSyxTQUFDLGFBQWE7NEJBS25CLEtBQUs7bUJBUUwsS0FBSzswQkFPTCxNQUFNO29CQU9OLE1BQU07cUJBUU4sTUFBTTs7QUEwS1Q7Ozs7OztHQU1HO0FBWUgsTUFBTSxPQUFPLGNBQWM7SUFVekIsWUFBbUIsU0FBdUIsRUFBNkIsS0FBZTtRQUFuRSxjQUFTLEdBQVQsU0FBUyxDQUFjO1FBQTZCLFVBQUssR0FBTCxLQUFLLENBQVU7SUFBRyxDQUFDO0lBUDFGLElBQ0ksY0FBYyxDQUFDLEtBQWU7UUFDaEMsSUFBSSxLQUFLLEVBQUU7WUFDVCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztTQUNwQjtJQUNILENBQUM7OztZQW5CRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHdCQUF3QjtnQkFDbEMsSUFBSSxFQUFFO29CQUNKLE1BQU0sRUFBRSxRQUFRO29CQUNoQixZQUFZLEVBQUUsZ0JBQWdCO29CQUM5QixtQkFBbUIsRUFBRSxlQUFlO29CQUNwQyxzQkFBc0IsRUFBRSxjQUFjO29CQUN0QyxzQkFBc0IsRUFBRSxVQUFVO29CQUNsQyxTQUFTLEVBQUUsNEJBQTRCO2lCQUN4QzthQUNGOzs7WUFXK0IsWUFBWTtZQUFvQyxRQUFRLHVCQUF6QyxRQUFRLFlBQUksSUFBSTs7OzZCQVA1RCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSG9zdCxcbiAgSW5wdXQsXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFF1ZXJ5TGlzdCxcbiAgVGVtcGxhdGVSZWYsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBOZ1pvbmUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2lzU3RyaW5nfSBmcm9tICcuLi91dGlsL3V0aWwnO1xuXG5pbXBvcnQge05nYkFjY29yZGlvbkNvbmZpZ30gZnJvbSAnLi9hY2NvcmRpb24tY29uZmlnJztcbmltcG9ydCB7bmdiUnVuVHJhbnNpdGlvbn0gZnJvbSAnLi4vdXRpbC90cmFuc2l0aW9uL25nYlRyYW5zaXRpb24nO1xuaW1wb3J0IHtuZ2JDb2xsYXBzaW5nVHJhbnNpdGlvbn0gZnJvbSAnLi4vdXRpbC90cmFuc2l0aW9uL25nYkNvbGxhcHNlVHJhbnNpdGlvbic7XG5pbXBvcnQge3Rha2V9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxubGV0IG5leHRJZCA9IDA7XG5cbi8qKlxuICogVGhlIGNvbnRleHQgZm9yIHRoZSBbTmdiUGFuZWxIZWFkZXJdKCMvY29tcG9uZW50cy9hY2NvcmRpb24vYXBpI05nYlBhbmVsSGVhZGVyKSB0ZW1wbGF0ZVxuICpcbiAqIEBzaW5jZSA0LjEuMFxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5nYlBhbmVsSGVhZGVyQ29udGV4dCB7XG4gIC8qKlxuICAgKiBgVHJ1ZWAgaWYgY3VycmVudCBwYW5lbCBpcyBvcGVuZWRcbiAgICovXG4gIG9wZW5lZDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIGFuIGFjY29yZGlvbiBwYW5lbCBoZWFkZXIgd2l0aCBhbnkgSFRNTCBtYXJrdXAgYW5kIGEgdG9nZ2xpbmcgYnV0dG9uXG4gKiBtYXJrZWQgd2l0aCBbYE5nYlBhbmVsVG9nZ2xlYF0oIy9jb21wb25lbnRzL2FjY29yZGlvbi9hcGkjTmdiUGFuZWxUb2dnbGUpLlxuICogU2VlIHRoZSBbaGVhZGVyIGN1c3RvbWl6YXRpb24gZGVtb10oIy9jb21wb25lbnRzL2FjY29yZGlvbi9leGFtcGxlcyNoZWFkZXIpIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IGNhbiBhbHNvIHVzZSBbYE5nYlBhbmVsVGl0bGVgXSgjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FwaSNOZ2JQYW5lbFRpdGxlKSB0byBjdXN0b21pemUgb25seSB0aGUgcGFuZWwgdGl0bGUuXG4gKlxuICogQHNpbmNlIDQuMS4wXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnbmctdGVtcGxhdGVbbmdiUGFuZWxIZWFkZXJdJ30pXG5leHBvcnQgY2xhc3MgTmdiUGFuZWxIZWFkZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT4pIHt9XG59XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdGhhdCB3cmFwcyBvbmx5IHRoZSBwYW5lbCB0aXRsZSB3aXRoIEhUTUwgbWFya3VwIGluc2lkZS5cbiAqXG4gKiBZb3UgY2FuIGFsc28gdXNlIFtgTmdiUGFuZWxIZWFkZXJgXSgjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FwaSNOZ2JQYW5lbEhlYWRlcikgdG8gY3VzdG9taXplIHRoZSBmdWxsIHBhbmVsIGhlYWRlci5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtuZ2JQYW5lbFRpdGxlXSd9KVxuZXhwb3J0IGNsYXNzIE5nYlBhbmVsVGl0bGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT4pIHt9XG59XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdGhhdCB3cmFwcyB0aGUgYWNjb3JkaW9uIHBhbmVsIGNvbnRlbnQuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnbmctdGVtcGxhdGVbbmdiUGFuZWxDb250ZW50XSd9KVxuZXhwb3J0IGNsYXNzIE5nYlBhbmVsQ29udGVudCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55Pikge31cbn1cblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIGFuIGluZGl2aWR1YWwgYWNjb3JkaW9uIHBhbmVsIHdpdGggdGl0bGUgYW5kIGNvbGxhcHNpYmxlIGNvbnRlbnQuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnbmdiLXBhbmVsJ30pXG5leHBvcnQgY2xhc3MgTmdiUGFuZWwgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRDaGVja2VkIHtcbiAgLyoqXG4gICAqICBJZiBgdHJ1ZWAsIHRoZSBwYW5lbCBpcyBkaXNhYmxlZCBhbiBjYW4ndCBiZSB0b2dnbGVkLlxuICAgKi9cbiAgQElucHV0KCkgZGlzYWJsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogIEFuIG9wdGlvbmFsIGlkIGZvciB0aGUgcGFuZWwgdGhhdCBtdXN0IGJlIHVuaXF1ZSBvbiB0aGUgcGFnZS5cbiAgICpcbiAgICogIElmIG5vdCBwcm92aWRlZCwgaXQgd2lsbCBiZSBhdXRvLWdlbmVyYXRlZCBpbiB0aGUgYG5nYi1wYW5lbC14eHhgIGZvcm1hdC5cbiAgICovXG4gIEBJbnB1dCgpIGlkID0gYG5nYi1wYW5lbC0ke25leHRJZCsrfWA7XG5cbiAgaXNPcGVuID0gZmFsc2U7XG5cbiAgLyogQSBmbGFnIHRvIHNwZWNpZmllZCB0aGF0IHRoZSB0cmFuc2l0aW9uIHBhbmVsIGNsYXNzZXMgaGF2ZSBiZWVuIGluaXRpYWxpemVkICovXG4gIGluaXRDbGFzc0RvbmUgPSBmYWxzZTtcblxuICAvKiBBIGZsYWcgdG8gc3BlY2lmaWVkIGlmIHRoZSBwYW5lbCBpcyBjdXJyZW50bHkgYmVpbmcgYW5pbWF0ZWQsIHRvIGVuc3VyZSBpdHMgcHJlc2VuY2UgaW4gdGhlIGRvbSAqL1xuICB0cmFuc2l0aW9uUnVubmluZyA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiAgVGhlIHBhbmVsIHRpdGxlLlxuICAgKlxuICAgKiAgWW91IGNhbiBhbHRlcm5hdGl2ZWx5IHVzZSBbYE5nYlBhbmVsVGl0bGVgXSgjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FwaSNOZ2JQYW5lbFRpdGxlKSB0byBzZXQgcGFuZWwgdGl0bGUuXG4gICAqL1xuICBASW5wdXQoKSB0aXRsZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUeXBlIG9mIHRoZSBjdXJyZW50IHBhbmVsLlxuICAgKlxuICAgKiBCb290c3RyYXAgcHJvdmlkZXMgc3R5bGVzIGZvciB0aGUgZm9sbG93aW5nIHR5cGVzOiBgJ3N1Y2Nlc3MnYCwgYCdpbmZvJ2AsIGAnd2FybmluZydgLCBgJ2RhbmdlcidgLCBgJ3ByaW1hcnknYCxcbiAgICogYCdzZWNvbmRhcnknYCwgYCdsaWdodCdgIGFuZCBgJ2RhcmsnYC5cbiAgICovXG4gIEBJbnB1dCgpIHR5cGU6IHN0cmluZztcblxuICAvKipcbiAgICogQW4gb3B0aW9uYWwgY2xhc3MgYXBwbGllZCB0byB0aGUgYWNjb3JkaW9uIGNhcmQgZWxlbWVudCB0aGF0IHdyYXBzIGJvdGggcGFuZWwgdGl0bGUgYW5kIGNvbnRlbnQuXG4gICAqXG4gICAqIEBzaW5jZSA1LjMuMFxuICAgKi9cbiAgQElucHV0KCkgY2FyZENsYXNzOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEFuIGV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgcGFuZWwgaXMgc2hvd24sIGFmdGVyIHRoZSB0cmFuc2l0aW9uLiBJdCBoYXMgbm8gcGF5bG9hZC5cbiAgICpcbiAgICogQHNpbmNlIDguMC4wXG4gICAqL1xuICBAT3V0cHV0KCkgc2hvd24gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIEFuIGV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgcGFuZWwgaXMgaGlkZGVuLCBhZnRlciB0aGUgdHJhbnNpdGlvbi4gSXQgaGFzIG5vIHBheWxvYWQuXG4gICAqXG4gICAqIEBzaW5jZSA4LjAuMFxuICAgKi9cbiAgQE91dHB1dCgpIGhpZGRlbiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuXG4gIHRpdGxlVHBsOiBOZ2JQYW5lbFRpdGxlO1xuICBoZWFkZXJUcGw6IE5nYlBhbmVsSGVhZGVyO1xuICBjb250ZW50VHBsOiBOZ2JQYW5lbENvbnRlbnQ7XG5cbiAgQENvbnRlbnRDaGlsZHJlbihOZ2JQYW5lbFRpdGxlLCB7ZGVzY2VuZGFudHM6IGZhbHNlfSkgdGl0bGVUcGxzOiBRdWVyeUxpc3Q8TmdiUGFuZWxUaXRsZT47XG4gIEBDb250ZW50Q2hpbGRyZW4oTmdiUGFuZWxIZWFkZXIsIHtkZXNjZW5kYW50czogZmFsc2V9KSBoZWFkZXJUcGxzOiBRdWVyeUxpc3Q8TmdiUGFuZWxIZWFkZXI+O1xuICBAQ29udGVudENoaWxkcmVuKE5nYlBhbmVsQ29udGVudCwge2Rlc2NlbmRhbnRzOiBmYWxzZX0pIGNvbnRlbnRUcGxzOiBRdWVyeUxpc3Q8TmdiUGFuZWxDb250ZW50PjtcblxuICBuZ0FmdGVyQ29udGVudENoZWNrZWQoKSB7XG4gICAgLy8gV2UgYXJlIHVzaW5nIEBDb250ZW50Q2hpbGRyZW4gaW5zdGVhZCBvZiBAQ29udGVudENoaWxkIGFzIGluIHRoZSBBbmd1bGFyIHZlcnNpb24gYmVpbmcgdXNlZFxuICAgIC8vIG9ubHkgQENvbnRlbnRDaGlsZHJlbiBhbGxvd3MgdXMgdG8gc3BlY2lmeSB0aGUge2Rlc2NlbmRhbnRzOiBmYWxzZX0gb3B0aW9uLlxuICAgIC8vIFdpdGhvdXQge2Rlc2NlbmRhbnRzOiBmYWxzZX0gd2UgYXJlIGhpdHRpbmcgYnVncyBkZXNjcmliZWQgaW46XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXAvaXNzdWVzLzIyNDBcbiAgICB0aGlzLnRpdGxlVHBsID0gdGhpcy50aXRsZVRwbHMuZmlyc3Q7XG4gICAgdGhpcy5oZWFkZXJUcGwgPSB0aGlzLmhlYWRlclRwbHMuZmlyc3Q7XG4gICAgdGhpcy5jb250ZW50VHBsID0gdGhpcy5jb250ZW50VHBscy5maXJzdDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGV2ZW50IGVtaXR0ZWQgcmlnaHQgYmVmb3JlIHRvZ2dsaW5nIGFuIGFjY29yZGlvbiBwYW5lbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOZ2JQYW5lbENoYW5nZUV2ZW50IHtcbiAgLyoqXG4gICAqIFRoZSBpZCBvZiB0aGUgYWNjb3JkaW9uIHBhbmVsIGJlaW5nIHRvZ2dsZWQuXG4gICAqL1xuICBwYW5lbElkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBuZXh0IHN0YXRlIG9mIHRoZSBwYW5lbC5cbiAgICpcbiAgICogYHRydWVgIGlmIGl0IHdpbGwgYmUgb3BlbmVkLCBgZmFsc2VgIGlmIGNsb3NlZC5cbiAgICovXG4gIG5leHRTdGF0ZTogYm9vbGVhbjtcblxuICAvKipcbiAgICogQ2FsbGluZyB0aGlzIGZ1bmN0aW9uIHdpbGwgcHJldmVudCBwYW5lbCB0b2dnbGluZy5cbiAgICovXG4gIHByZXZlbnREZWZhdWx0OiAoKSA9PiB2b2lkO1xufVxuXG4vKipcbiAqIEFjY29yZGlvbiBpcyBhIGNvbGxlY3Rpb24gb2YgY29sbGFwc2libGUgcGFuZWxzIChib290c3RyYXAgY2FyZHMpLlxuICpcbiAqIEl0IGNhbiBlbnN1cmUgb25seSBvbmUgcGFuZWwgaXMgb3BlbmVkIGF0IGEgdGltZSBhbmQgYWxsb3dzIHRvIGN1c3RvbWl6ZSBwYW5lbFxuICogaGVhZGVycy5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmdiLWFjY29yZGlvbicsXG4gIGV4cG9ydEFzOiAnbmdiQWNjb3JkaW9uJyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgaG9zdDogeydjbGFzcyc6ICdhY2NvcmRpb24nLCAncm9sZSc6ICd0YWJsaXN0JywgJ1thdHRyLmFyaWEtbXVsdGlzZWxlY3RhYmxlXSc6ICchY2xvc2VPdGhlclBhbmVscyd9LFxuICB0ZW1wbGF0ZTogYFxuICAgIDxuZy10ZW1wbGF0ZSAjdCBuZ2JQYW5lbEhlYWRlciBsZXQtcGFuZWw+XG4gICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1saW5rXCIgW25nYlBhbmVsVG9nZ2xlXT1cInBhbmVsXCI+XG4gICAgICAgIHt7cGFuZWwudGl0bGV9fTxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJwYW5lbC50aXRsZVRwbD8udGVtcGxhdGVSZWZcIj48L25nLXRlbXBsYXRlPlxuICAgICAgPC9idXR0b24+XG4gICAgPC9uZy10ZW1wbGF0ZT5cbiAgICA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LXBhbmVsIFtuZ0Zvck9mXT1cInBhbmVsc1wiPlxuICAgICAgPGRpdiBbY2xhc3NdPVwiJ2NhcmQgJyArIChwYW5lbC5jYXJkQ2xhc3MgfHwgJycpXCI+XG4gICAgICAgIDxkaXYgcm9sZT1cInRhYlwiIGlkPVwie3twYW5lbC5pZH19LWhlYWRlclwiIFtjbGFzc109XCInY2FyZC1oZWFkZXIgJyArIChwYW5lbC50eXBlID8gJ2JnLScrcGFuZWwudHlwZTogdHlwZSA/ICdiZy0nK3R5cGUgOiAnJylcIj5cbiAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwicGFuZWwuaGVhZGVyVHBsPy50ZW1wbGF0ZVJlZiB8fCB0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInskaW1wbGljaXQ6IHBhbmVsLCBvcGVuZWQ6IHBhbmVsLmlzT3Blbn1cIj48L25nLXRlbXBsYXRlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBpZD1cInt7cGFuZWwuaWR9fVwiIHJvbGU9XCJ0YWJwYW5lbFwiIFthdHRyLmFyaWEtbGFiZWxsZWRieV09XCJwYW5lbC5pZCArICctaGVhZGVyJ1wiXG4gICAgICAgICAgICAgKm5nSWY9XCIhZGVzdHJveU9uSGlkZSB8fCBwYW5lbC5pc09wZW4gfHwgcGFuZWwudHJhbnNpdGlvblJ1bm5pbmdcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1ib2R5XCI+XG4gICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwicGFuZWwuY29udGVudFRwbD8udGVtcGxhdGVSZWYgfHwgbnVsbFwiPjwvbmctdGVtcGxhdGU+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9uZy10ZW1wbGF0ZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBOZ2JBY2NvcmRpb24gaW1wbGVtZW50cyBBZnRlckNvbnRlbnRDaGVja2VkIHtcbiAgQENvbnRlbnRDaGlsZHJlbihOZ2JQYW5lbCkgcGFuZWxzOiBRdWVyeUxpc3Q8TmdiUGFuZWw+O1xuXG4gIC8qKlxuICAgKiBJZiBgdHJ1ZWAsIGFjY29yZGlvbiB3aWxsIGJlIGFuaW1hdGVkLlxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIEBJbnB1dCgpIGFuaW1hdGlvbjtcblxuICAvKipcbiAgICogQW4gYXJyYXkgb3IgY29tbWEgc2VwYXJhdGVkIHN0cmluZ3Mgb2YgcGFuZWwgaWRzIHRoYXQgc2hvdWxkIGJlIG9wZW5lZCAqKmluaXRpYWxseSoqLlxuICAgKlxuICAgKiBGb3Igc3Vic2VxdWVudCBjaGFuZ2VzIHVzZSBtZXRob2RzIGxpa2UgYGV4cGFuZCgpYCwgYGNvbGxhcHNlKClgLCBldGMuIGFuZFxuICAgKiB0aGUgYChwYW5lbENoYW5nZSlgIGV2ZW50LlxuICAgKi9cbiAgQElucHV0KCkgYWN0aXZlSWRzOiBzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiAgSWYgYHRydWVgLCBvbmx5IG9uZSBwYW5lbCBjb3VsZCBiZSBvcGVuZWQgYXQgYSB0aW1lLlxuICAgKlxuICAgKiAgT3BlbmluZyBhIG5ldyBwYW5lbCB3aWxsIGNsb3NlIG90aGVycy5cbiAgICovXG4gIEBJbnB1dCgnY2xvc2VPdGhlcnMnKSBjbG9zZU90aGVyUGFuZWxzOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBJZiBgdHJ1ZWAsIHBhbmVsIGNvbnRlbnQgd2lsbCBiZSBkZXRhY2hlZCBmcm9tIERPTSBhbmQgbm90IHNpbXBseSBoaWRkZW4gd2hlbiB0aGUgcGFuZWwgaXMgY29sbGFwc2VkLlxuICAgKi9cbiAgQElucHV0KCkgZGVzdHJveU9uSGlkZSA9IHRydWU7XG5cbiAgLyoqXG4gICAqIFR5cGUgb2YgcGFuZWxzLlxuICAgKlxuICAgKiBCb290c3RyYXAgcHJvdmlkZXMgc3R5bGVzIGZvciB0aGUgZm9sbG93aW5nIHR5cGVzOiBgJ3N1Y2Nlc3MnYCwgYCdpbmZvJ2AsIGAnd2FybmluZydgLCBgJ2RhbmdlcidgLCBgJ3ByaW1hcnknYCxcbiAgICogYCdzZWNvbmRhcnknYCwgYCdsaWdodCdgIGFuZCBgJ2RhcmsnYC5cbiAgICovXG4gIEBJbnB1dCgpIHR5cGU6IHN0cmluZztcblxuICAvKipcbiAgICogRXZlbnQgZW1pdHRlZCByaWdodCBiZWZvcmUgdGhlIHBhbmVsIHRvZ2dsZSBoYXBwZW5zLlxuICAgKlxuICAgKiBTZWUgW05nYlBhbmVsQ2hhbmdlRXZlbnRdKCMvY29tcG9uZW50cy9hY2NvcmRpb24vYXBpI05nYlBhbmVsQ2hhbmdlRXZlbnQpIGZvciBwYXlsb2FkIGRldGFpbHMuXG4gICAqL1xuICBAT3V0cHV0KCkgcGFuZWxDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPE5nYlBhbmVsQ2hhbmdlRXZlbnQ+KCk7XG5cbiAgLyoqXG4gICAqIEFuIGV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgZXhwYW5kaW5nIGFuaW1hdGlvbiBpcyBmaW5pc2hlZCBvbiB0aGUgcGFuZWwuIFRoZSBwYXlsb2FkIGlzIHRoZSBwYW5lbCBpZC5cbiAgICpcbiAgICogQHNpbmNlIDguMC4wXG4gICAqL1xuICBAT3V0cHV0KCkgc2hvd24gPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcblxuICAvKipcbiAgICogQW4gZXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBjb2xsYXBzaW5nIGFuaW1hdGlvbiBpcyBmaW5pc2hlZCBvbiB0aGUgcGFuZWwsIGFuZCBiZWZvcmUgdGhlIHBhbmVsIGVsZW1lbnQgaXMgcmVtb3ZlZC5cbiAgICogVGhlIHBheWxvYWQgaXMgdGhlIHBhbmVsIGlkLlxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIEBPdXRwdXQoKSBoaWRkZW4gPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGNvbmZpZzogTmdiQWNjb3JkaW9uQ29uZmlnLCBwcml2YXRlIF9lbGVtZW50OiBFbGVtZW50UmVmLCBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZikge1xuICAgIHRoaXMuYW5pbWF0aW9uID0gY29uZmlnLmFuaW1hdGlvbjtcbiAgICB0aGlzLnR5cGUgPSBjb25maWcudHlwZTtcbiAgICB0aGlzLmNsb3NlT3RoZXJQYW5lbHMgPSBjb25maWcuY2xvc2VPdGhlcnM7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGEgcGFuZWwgd2l0aCBhIGdpdmVuIGlkIGlzIGV4cGFuZGVkLlxuICAgKi9cbiAgaXNFeHBhbmRlZChwYW5lbElkOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuYWN0aXZlSWRzLmluZGV4T2YocGFuZWxJZCkgPiAtMTsgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIGEgcGFuZWwgd2l0aCBhIGdpdmVuIGlkLlxuICAgKlxuICAgKiBIYXMgbm8gZWZmZWN0IGlmIHRoZSBwYW5lbCBpcyBhbHJlYWR5IGV4cGFuZGVkIG9yIGRpc2FibGVkLlxuICAgKi9cbiAgZXhwYW5kKHBhbmVsSWQ6IHN0cmluZyk6IHZvaWQgeyB0aGlzLl9jaGFuZ2VPcGVuU3RhdGUodGhpcy5fZmluZFBhbmVsQnlJZChwYW5lbElkKSwgdHJ1ZSk7IH1cblxuICAvKipcbiAgICogRXhwYW5kcyBhbGwgcGFuZWxzLCBpZiBgW2Nsb3NlT3RoZXJzXWAgaXMgYGZhbHNlYC5cbiAgICpcbiAgICogSWYgYFtjbG9zZU90aGVyc11gIGlzIGB0cnVlYCwgaXQgd2lsbCBleHBhbmQgdGhlIGZpcnN0IHBhbmVsLCB1bmxlc3MgdGhlcmUgaXMgYWxyZWFkeSBhIHBhbmVsIG9wZW5lZC5cbiAgICovXG4gIGV4cGFuZEFsbCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jbG9zZU90aGVyUGFuZWxzKSB7XG4gICAgICBpZiAodGhpcy5hY3RpdmVJZHMubGVuZ3RoID09PSAwICYmIHRoaXMucGFuZWxzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9jaGFuZ2VPcGVuU3RhdGUodGhpcy5wYW5lbHMuZmlyc3QsIHRydWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBhbmVscy5mb3JFYWNoKHBhbmVsID0+IHRoaXMuX2NoYW5nZU9wZW5TdGF0ZShwYW5lbCwgdHJ1ZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb2xsYXBzZXMgYSBwYW5lbCB3aXRoIHRoZSBnaXZlbiBpZC5cbiAgICpcbiAgICogSGFzIG5vIGVmZmVjdCBpZiB0aGUgcGFuZWwgaXMgYWxyZWFkeSBjb2xsYXBzZWQgb3IgZGlzYWJsZWQuXG4gICAqL1xuICBjb2xsYXBzZShwYW5lbElkOiBzdHJpbmcpIHsgdGhpcy5fY2hhbmdlT3BlblN0YXRlKHRoaXMuX2ZpbmRQYW5lbEJ5SWQocGFuZWxJZCksIGZhbHNlKTsgfVxuXG4gIC8qKlxuICAgKiBDb2xsYXBzZXMgYWxsIG9wZW5lZCBwYW5lbHMuXG4gICAqL1xuICBjb2xsYXBzZUFsbCgpIHtcbiAgICB0aGlzLnBhbmVscy5mb3JFYWNoKChwYW5lbCkgPT4geyB0aGlzLl9jaGFuZ2VPcGVuU3RhdGUocGFuZWwsIGZhbHNlKTsgfSk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyBhIHBhbmVsIHdpdGggdGhlIGdpdmVuIGlkLlxuICAgKlxuICAgKiBIYXMgbm8gZWZmZWN0IGlmIHRoZSBwYW5lbCBpcyBkaXNhYmxlZC5cbiAgICovXG4gIHRvZ2dsZShwYW5lbElkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYW5lbCA9IHRoaXMuX2ZpbmRQYW5lbEJ5SWQocGFuZWxJZCk7XG4gICAgaWYgKHBhbmVsKSB7XG4gICAgICB0aGlzLl9jaGFuZ2VPcGVuU3RhdGUocGFuZWwsICFwYW5lbC5pc09wZW4pO1xuICAgIH1cbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpIHtcbiAgICAvLyBhY3RpdmUgaWQgdXBkYXRlc1xuICAgIGlmIChpc1N0cmluZyh0aGlzLmFjdGl2ZUlkcykpIHtcbiAgICAgIHRoaXMuYWN0aXZlSWRzID0gdGhpcy5hY3RpdmVJZHMuc3BsaXQoL1xccyosXFxzKi8pO1xuICAgIH1cblxuICAgIC8vIHVwZGF0ZSBwYW5lbHMgb3BlbiBzdGF0ZXNcbiAgICB0aGlzLnBhbmVscy5mb3JFYWNoKHBhbmVsID0+IHsgcGFuZWwuaXNPcGVuID0gIXBhbmVsLmRpc2FibGVkICYmIHRoaXMuYWN0aXZlSWRzLmluZGV4T2YocGFuZWwuaWQpID4gLTE7IH0pO1xuXG4gICAgLy8gY2xvc2VPdGhlcnMgdXBkYXRlc1xuICAgIGlmICh0aGlzLmFjdGl2ZUlkcy5sZW5ndGggPiAxICYmIHRoaXMuY2xvc2VPdGhlclBhbmVscykge1xuICAgICAgdGhpcy5fY2xvc2VPdGhlcnModGhpcy5hY3RpdmVJZHNbMF0sIGZhbHNlKTtcbiAgICAgIHRoaXMuX3VwZGF0ZUFjdGl2ZUlkcygpO1xuICAgIH1cblxuICAgIC8vIFNldHVwIHRoZSBpbml0aWFsIGNsYXNzZXMgaGVyZVxuICAgIHRoaXMuX25nWm9uZS5vblN0YWJsZS5waXBlKHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLnBhbmVscy5mb3JFYWNoKHBhbmVsID0+IHtcbiAgICAgICAgY29uc3QgcGFuZWxFbGVtZW50ID0gdGhpcy5fZ2V0UGFuZWxFbGVtZW50KHBhbmVsLmlkKTtcbiAgICAgICAgaWYgKHBhbmVsRWxlbWVudCkge1xuICAgICAgICAgIGlmICghcGFuZWwuaW5pdENsYXNzRG9uZSkge1xuICAgICAgICAgICAgcGFuZWwuaW5pdENsYXNzRG9uZSA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCB7Y2xhc3NMaXN0fSA9IHBhbmVsRWxlbWVudDtcbiAgICAgICAgICAgIGNsYXNzTGlzdC5hZGQoJ2NvbGxhcHNlJyk7XG4gICAgICAgICAgICBpZiAocGFuZWwuaXNPcGVuKSB7XG4gICAgICAgICAgICAgIGNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQ2xhc3NlcyBtdXN0IGJlIGluaXRpYWxpemVkIG5leHQgdGltZSBpdCB3aWxsIGJlIGluIHRoZSBkb21cbiAgICAgICAgICBwYW5lbC5pbml0Q2xhc3NEb25lID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hhbmdlT3BlblN0YXRlKHBhbmVsOiBOZ2JQYW5lbCB8IG51bGwsIG5leHRTdGF0ZTogYm9vbGVhbikge1xuICAgIGlmIChwYW5lbCAhPSBudWxsICYmICFwYW5lbC5kaXNhYmxlZCAmJiBwYW5lbC5pc09wZW4gIT09IG5leHRTdGF0ZSkge1xuICAgICAgbGV0IGRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcblxuICAgICAgdGhpcy5wYW5lbENoYW5nZS5lbWl0KFxuICAgICAgICAgIHtwYW5lbElkOiBwYW5lbC5pZCwgbmV4dFN0YXRlOiBuZXh0U3RhdGUsIHByZXZlbnREZWZhdWx0OiAoKSA9PiB7IGRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlOyB9fSk7XG5cbiAgICAgIGlmICghZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICBwYW5lbC5pc09wZW4gPSBuZXh0U3RhdGU7XG4gICAgICAgIHBhbmVsLnRyYW5zaXRpb25SdW5uaW5nID0gdHJ1ZTtcblxuICAgICAgICBpZiAobmV4dFN0YXRlICYmIHRoaXMuY2xvc2VPdGhlclBhbmVscykge1xuICAgICAgICAgIHRoaXMuX2Nsb3NlT3RoZXJzKHBhbmVsLmlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91cGRhdGVBY3RpdmVJZHMoKTtcbiAgICAgICAgdGhpcy5fcnVuVHJhbnNpdGlvbnModGhpcy5hbmltYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2Nsb3NlT3RoZXJzKHBhbmVsSWQ6IHN0cmluZywgZW5hYmxlVHJhbnNpdGlvbiA9IHRydWUpIHtcbiAgICB0aGlzLnBhbmVscy5mb3JFYWNoKHBhbmVsID0+IHtcbiAgICAgIGlmIChwYW5lbC5pZCAhPT0gcGFuZWxJZCAmJiBwYW5lbC5pc09wZW4pIHtcbiAgICAgICAgcGFuZWwuaXNPcGVuID0gZmFsc2U7XG4gICAgICAgIHBhbmVsLnRyYW5zaXRpb25SdW5uaW5nID0gZW5hYmxlVHJhbnNpdGlvbjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2ZpbmRQYW5lbEJ5SWQocGFuZWxJZDogc3RyaW5nKTogTmdiUGFuZWwgfCBudWxsIHsgcmV0dXJuIHRoaXMucGFuZWxzLmZpbmQocCA9PiBwLmlkID09PSBwYW5lbElkKSB8fCBudWxsOyB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlQWN0aXZlSWRzKCkge1xuICAgIHRoaXMuYWN0aXZlSWRzID0gdGhpcy5wYW5lbHMuZmlsdGVyKHBhbmVsID0+IHBhbmVsLmlzT3BlbiAmJiAhcGFuZWwuZGlzYWJsZWQpLm1hcChwYW5lbCA9PiBwYW5lbC5pZCk7XG4gIH1cblxuICBwcml2YXRlIF9ydW5UcmFuc2l0aW9ucyhhbmltYXRpb246IGJvb2xlYW4sIGVtaXRFdmVudCA9IHRydWUpIHtcbiAgICAvLyBkZXRlY3RDaGFuZ2VzIGlzIHBlcmZvcm1lZCB0byBlbnN1cmUgdGhhdCBhbGwgcGFuZWxzIGFyZSBpbiB0aGUgZG9tICh2aWEgdHJhbnNpdGlvblJ1bm5pbmcgPSB0cnVlKVxuICAgIC8vIGJlZm9yZSBzdGFydGluZyB0aGUgYW5pbWF0aW9uXG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpO1xuXG4gICAgdGhpcy5wYW5lbHMuZm9yRWFjaChwYW5lbCA9PiB7XG4gICAgICAvLyBXaGVuIHBhbmVsLnRyYW5zaXRpb25SdW5uaW5nIGlzIHRydWUsIHRoZSB0cmFuc2l0aW9uIG5lZWRzIHRvIGJlIHN0YXJ0ZWQgT1IgcmV2ZXJzZWQsXG4gICAgICAvLyBUaGUgZGlyZWN0aW9uIChzaG93IG9yIGhpZGUpIGlzIGNob29zZW4gYnkgZWFjaCBwYW5lbC5pc09wZW4gc3RhdGVcbiAgICAgIGlmIChwYW5lbC50cmFuc2l0aW9uUnVubmluZykge1xuICAgICAgICBjb25zdCBwYW5lbEVsZW1lbnQgPSB0aGlzLl9nZXRQYW5lbEVsZW1lbnQocGFuZWwuaWQpO1xuICAgICAgICBuZ2JSdW5UcmFuc2l0aW9uKHBhbmVsRWxlbWVudCAhLCBuZ2JDb2xsYXBzaW5nVHJhbnNpdGlvbiwge1xuICAgICAgICAgIGFuaW1hdGlvbixcbiAgICAgICAgICBydW5uaW5nVHJhbnNpdGlvbjogJ3N0b3AnLFxuICAgICAgICAgIGNvbnRleHQ6IHtkaXJlY3Rpb246IHBhbmVsLmlzT3BlbiA/ICdzaG93JyA6ICdoaWRlJ31cbiAgICAgICAgfSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICBwYW5lbC50cmFuc2l0aW9uUnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgIGlmIChlbWl0RXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSBwYW5lbDtcbiAgICAgICAgICAgIGlmIChwYW5lbC5pc09wZW4pIHtcbiAgICAgICAgICAgICAgcGFuZWwuc2hvd24uZW1pdCgpO1xuICAgICAgICAgICAgICB0aGlzLnNob3duLmVtaXQoaWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcGFuZWwuaGlkZGVuLmVtaXQoKTtcbiAgICAgICAgICAgICAgdGhpcy5oaWRkZW4uZW1pdChpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBhbmVsRWxlbWVudChwYW5lbElkOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignIycgKyBwYW5lbElkKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRvIHB1dCBvbiBhIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgcGFuZWwgb3BlbmluZyBhbmQgY2xvc2luZy5cbiAqXG4gKiBUbyBiZSB1c2VkIGluc2lkZSB0aGUgW2BOZ2JQYW5lbEhlYWRlcmBdKCMvY29tcG9uZW50cy9hY2NvcmRpb24vYXBpI05nYlBhbmVsSGVhZGVyKVxuICpcbiAqIEBzaW5jZSA0LjEuMFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdidXR0b25bbmdiUGFuZWxUb2dnbGVdJyxcbiAgaG9zdDoge1xuICAgICd0eXBlJzogJ2J1dHRvbicsXG4gICAgJ1tkaXNhYmxlZF0nOiAncGFuZWwuZGlzYWJsZWQnLFxuICAgICdbY2xhc3MuY29sbGFwc2VkXSc6ICchcGFuZWwuaXNPcGVuJyxcbiAgICAnW2F0dHIuYXJpYS1leHBhbmRlZF0nOiAncGFuZWwuaXNPcGVuJyxcbiAgICAnW2F0dHIuYXJpYS1jb250cm9sc10nOiAncGFuZWwuaWQnLFxuICAgICcoY2xpY2spJzogJ2FjY29yZGlvbi50b2dnbGUocGFuZWwuaWQpJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIE5nYlBhbmVsVG9nZ2xlIHtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX25nYlBhbmVsVG9nZ2xlOiBOZ2JQYW5lbCB8ICcnO1xuXG4gIEBJbnB1dCgpXG4gIHNldCBuZ2JQYW5lbFRvZ2dsZShwYW5lbDogTmdiUGFuZWwpIHtcbiAgICBpZiAocGFuZWwpIHtcbiAgICAgIHRoaXMucGFuZWwgPSBwYW5lbDtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgYWNjb3JkaW9uOiBOZ2JBY2NvcmRpb24sIEBPcHRpb25hbCgpIEBIb3N0KCkgcHVibGljIHBhbmVsOiBOZ2JQYW5lbCkge31cbn1cbiJdfQ==