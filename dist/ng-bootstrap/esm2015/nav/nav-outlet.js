import { ChangeDetectorRef, Component, Directive, ElementRef, Input, ViewChildren, ViewEncapsulation } from '@angular/core';
import { distinctUntilChanged, skip, startWith, takeUntil } from 'rxjs/operators';
import { ngbNavFadeInNoReflowTransition, ngbNavFadeInTransition, ngbNavFadeOutTransition } from './nav-transition';
import { ngbRunTransition } from '../util/transition/ngbTransition';
export class NgbNavPane {
    constructor(elRef) {
        this.elRef = elRef;
    }
}
NgbNavPane.decorators = [
    { type: Directive, args: [{
                selector: '[ngbNavPane]',
                host: {
                    '[id]': 'item.panelDomId',
                    'class': 'tab-pane',
                    '[class.fade]': 'nav.animation',
                    '[attr.role]': 'role ? role : nav.roles ? "tabpanel" : undefined',
                    '[attr.aria-labelledby]': 'item.domId'
                }
            },] }
];
NgbNavPane.ctorParameters = () => [
    { type: ElementRef }
];
NgbNavPane.propDecorators = {
    item: [{ type: Input }],
    nav: [{ type: Input }],
    role: [{ type: Input }]
};
/**
 * The outlet where currently active nav content will be displayed.
 *
 * @since 5.2.0
 */
export class NgbNavOutlet {
    constructor(_cd) {
        this._cd = _cd;
        this._activePane = null;
    }
    isPanelTransitioning(item) { var _a; return ((_a = this._activePane) === null || _a === void 0 ? void 0 : _a.item) === item; }
    ngAfterViewInit() {
        var _a;
        // initial display
        this._updateActivePane();
        // this will be emitted for all 3 types of nav changes: .select(), [activeId] or (click)
        this.nav.navItemChange$
            .pipe(takeUntil(this.nav.destroy$), startWith(((_a = this._activePane) === null || _a === void 0 ? void 0 : _a.item) || null), distinctUntilChanged(), skip(1))
            .subscribe(nextItem => {
            const options = { animation: this.nav.animation, runningTransition: 'stop' };
            // next panel we're switching to will only appear in DOM after the change detection is done
            // and `this._panes` will be updated
            this._cd.detectChanges();
            // fading out
            if (this._activePane) {
                ngbRunTransition(this._activePane.elRef.nativeElement, ngbNavFadeOutTransition, options).subscribe(() => {
                    var _a;
                    const activeItem = (_a = this._activePane) === null || _a === void 0 ? void 0 : _a.item;
                    this._activePane = this._getPaneForItem(nextItem);
                    // fading in
                    if (this._activePane) {
                        const fadeInTransition = this.nav.animation ? ngbNavFadeInTransition : ngbNavFadeInNoReflowTransition;
                        ngbRunTransition(this._activePane.elRef.nativeElement, fadeInTransition, options).subscribe(() => {
                            if (nextItem) {
                                nextItem.shown.emit();
                                this.nav.shown.emit(nextItem.id);
                            }
                        });
                    }
                    if (activeItem) {
                        activeItem.hidden.emit();
                        this.nav.hidden.emit(activeItem.id);
                    }
                });
            }
            else {
                this._updateActivePane();
            }
        });
    }
    _updateActivePane() {
        var _a, _b;
        this._activePane = this._getActivePane();
        (_a = this._activePane) === null || _a === void 0 ? void 0 : _a.elRef.nativeElement.classList.add('show');
        (_b = this._activePane) === null || _b === void 0 ? void 0 : _b.elRef.nativeElement.classList.add('active');
    }
    _getPaneForItem(item) {
        return this._panes && this._panes.find(pane => pane.item === item) || null;
    }
    _getActivePane() {
        return this._panes && this._panes.find(pane => pane.item.active) || null;
    }
}
NgbNavOutlet.decorators = [
    { type: Component, args: [{
                selector: '[ngbNavOutlet]',
                host: { '[class.tab-content]': 'true' },
                encapsulation: ViewEncapsulation.None,
                template: `
    <ng-template ngFor let-item [ngForOf]="nav.items">
      <div ngbNavPane *ngIf="item.isPanelInDom() || isPanelTransitioning(item)" [item]="item" [nav]="nav" [role]="paneRole">
        <ng-template [ngTemplateOutlet]="item.contentTpl?.templateRef || null"
                     [ngTemplateOutletContext]="{$implicit: item.active || isPanelTransitioning(item)}"></ng-template>
      </div>
    </ng-template>
  `
            },] }
];
NgbNavOutlet.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
NgbNavOutlet.propDecorators = {
    _panes: [{ type: ViewChildren, args: [NgbNavPane,] }],
    paneRole: [{ type: Input }],
    nav: [{ type: Input, args: ['ngbNavOutlet',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2LW91dGxldC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvZ2FicmllbC9EZXZlbG9wbWVudC9uZy1ib290c3RyYXAvc3JjLyIsInNvdXJjZXMiOlsibmF2L25hdi1vdXRsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsU0FBUyxFQUNULFVBQVUsRUFDVixLQUFLLEVBRUwsWUFBWSxFQUNaLGlCQUFpQixFQUNsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVoRixPQUFPLEVBQUMsOEJBQThCLEVBQUUsc0JBQXNCLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqSCxPQUFPLEVBQUMsZ0JBQWdCLEVBQXVCLE1BQU0sa0NBQWtDLENBQUM7QUFheEYsTUFBTSxPQUFPLFVBQVU7SUFLckIsWUFBbUIsS0FBOEI7UUFBOUIsVUFBSyxHQUFMLEtBQUssQ0FBeUI7SUFBRyxDQUFDOzs7WUFmdEQsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxjQUFjO2dCQUN4QixJQUFJLEVBQUU7b0JBQ0osTUFBTSxFQUFFLGlCQUFpQjtvQkFDekIsT0FBTyxFQUFFLFVBQVU7b0JBQ25CLGNBQWMsRUFBRSxlQUFlO29CQUMvQixhQUFhLEVBQUUsa0RBQWtEO29CQUNqRSx3QkFBd0IsRUFBRSxZQUFZO2lCQUN2QzthQUNGOzs7WUFyQkMsVUFBVTs7O21CQXVCVCxLQUFLO2tCQUNMLEtBQUs7bUJBQ0wsS0FBSzs7QUFLUjs7OztHQUlHO0FBY0gsTUFBTSxPQUFPLFlBQVk7SUFldkIsWUFBb0IsR0FBc0I7UUFBdEIsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFkbEMsZ0JBQVcsR0FBc0IsSUFBSSxDQUFDO0lBY0QsQ0FBQztJQUU5QyxvQkFBb0IsQ0FBQyxJQUFnQixZQUFJ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LElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztJQUM3RSxDQUFDO0lBRU8sY0FBYztRQUNwQixPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQztJQUMzRSxDQUFDOzs7WUF2RkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLElBQUksRUFBRSxFQUFDLHFCQUFxQixFQUFFLE1BQU0sRUFBQztnQkFDckMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7Z0JBQ3JDLFFBQVEsRUFBRTs7Ozs7OztHQU9UO2FBQ0Y7OztZQWxEQyxpQkFBaUI7OztxQkFzRGhCLFlBQVksU0FBQyxVQUFVO3VCQUt2QixLQUFLO2tCQUtMLEtBQUssU0FBQyxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCxcbiAgUXVlcnlMaXN0LFxuICBWaWV3Q2hpbGRyZW4sXG4gIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtkaXN0aW5jdFVudGlsQ2hhbmdlZCwgc2tpcCwgc3RhcnRXaXRoLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtuZ2JOYXZGYWRlSW5Ob1JlZmxvd1RyYW5zaXRpb24sIG5nYk5hdkZhZGVJblRyYW5zaXRpb24sIG5nYk5hdkZhZGVPdXRUcmFuc2l0aW9ufSBmcm9tICcuL25hdi10cmFuc2l0aW9uJztcbmltcG9ydCB7bmdiUnVuVHJhbnNpdGlvbiwgTmdiVHJhbnNpdGlvbk9wdGlvbnN9IGZyb20gJy4uL3V0aWwvdHJhbnNpdGlvbi9uZ2JUcmFuc2l0aW9uJztcbmltcG9ydCB7TmdiTmF2LCBOZ2JOYXZJdGVtfSBmcm9tICcuL25hdic7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ2JOYXZQYW5lXScsXG4gIGhvc3Q6IHtcbiAgICAnW2lkXSc6ICdpdGVtLnBhbmVsRG9tSWQnLFxuICAgICdjbGFzcyc6ICd0YWItcGFuZScsXG4gICAgJ1tjbGFzcy5mYWRlXSc6ICduYXYuYW5pbWF0aW9uJyxcbiAgICAnW2F0dHIucm9sZV0nOiAncm9sZSA/IHJvbGUgOiBuYXYucm9sZXMgPyBcInRhYnBhbmVsXCIgOiB1bmRlZmluZWQnLFxuICAgICdbYXR0ci5hcmlhLWxhYmVsbGVkYnldJzogJ2l0ZW0uZG9tSWQnXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgTmdiTmF2UGFuZSB7XG4gIEBJbnB1dCgpIGl0ZW06IE5nYk5hdkl0ZW07XG4gIEBJbnB1dCgpIG5hdjogTmdiTmF2O1xuICBASW5wdXQoKSByb2xlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGVsUmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50Pikge31cbn1cblxuLyoqXG4gKiBUaGUgb3V0bGV0IHdoZXJlIGN1cnJlbnRseSBhY3RpdmUgbmF2IGNvbnRlbnQgd2lsbCBiZSBkaXNwbGF5ZWQuXG4gKlxuICogQHNpbmNlIDUuMi4wXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ1tuZ2JOYXZPdXRsZXRdJyxcbiAgaG9zdDogeydbY2xhc3MudGFiLWNvbnRlbnRdJzogJ3RydWUnfSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LWl0ZW0gW25nRm9yT2ZdPVwibmF2Lml0ZW1zXCI+XG4gICAgICA8ZGl2IG5nYk5hdlBhbmUgKm5nSWY9XCJpdGVtLmlzUGFuZWxJbkRvbSgpIHx8IGlzUGFuZWxUcmFuc2l0aW9uaW5nKGl0ZW0pXCIgW2l0ZW1dPVwiaXRlbVwiIFtuYXZdPVwibmF2XCIgW3JvbGVdPVwicGFuZVJvbGVcIj5cbiAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIml0ZW0uY29udGVudFRwbD8udGVtcGxhdGVSZWYgfHwgbnVsbFwiXG4gICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwieyRpbXBsaWNpdDogaXRlbS5hY3RpdmUgfHwgaXNQYW5lbFRyYW5zaXRpb25pbmcoaXRlbSl9XCI+PC9uZy10ZW1wbGF0ZT5cbiAgICAgIDwvZGl2PlxuICAgIDwvbmctdGVtcGxhdGU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgTmdiTmF2T3V0bGV0IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gIHByaXZhdGUgX2FjdGl2ZVBhbmU6IE5nYk5hdlBhbmUgfCBudWxsID0gbnVsbDtcblxuICBAVmlld0NoaWxkcmVuKE5nYk5hdlBhbmUpIHByaXZhdGUgX3BhbmVzOiBRdWVyeUxpc3Q8TmdiTmF2UGFuZT47XG5cbiAgLyoqXG4gICAqIEEgcm9sZSB0byBzZXQgb24gdGhlIG5hdiBwYW5lXG4gICAqL1xuICBASW5wdXQoKSBwYW5lUm9sZTtcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBgTmdiTmF2YFxuICAgKi9cbiAgQElucHV0KCduZ2JOYXZPdXRsZXQnKSBuYXY6IE5nYk5hdjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9jZDogQ2hhbmdlRGV0ZWN0b3JSZWYpIHt9XG5cbiAgaXNQYW5lbFRyYW5zaXRpb25pbmcoaXRlbTogTmdiTmF2SXRlbSkgeyByZXR1cm4gdGhpcy5fYWN0aXZlUGFuZSA/Lml0ZW0gPT09IGl0ZW07IH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgLy8gaW5pdGlhbCBkaXNwbGF5XG4gICAgdGhpcy5fdXBkYXRlQWN0aXZlUGFuZSgpO1xuXG4gICAgLy8gdGhpcyB3aWxsIGJlIGVtaXR0ZWQgZm9yIGFsbCAzIHR5cGVzIG9mIG5hdiBjaGFuZ2VzOiAuc2VsZWN0KCksIFthY3RpdmVJZF0gb3IgKGNsaWNrKVxuICAgIHRoaXMubmF2Lm5hdkl0ZW1DaGFuZ2UkXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5uYXYuZGVzdHJveSQpLCBzdGFydFdpdGgodGhpcy5fYWN0aXZlUGFuZSA/Lml0ZW0gfHwgbnVsbCksIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksIHNraXAoMSkpXG4gICAgICAuc3Vic2NyaWJlKG5leHRJdGVtID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbnM6IE5nYlRyYW5zaXRpb25PcHRpb25zPHVuZGVmaW5lZD4gPSB7YW5pbWF0aW9uOiB0aGlzLm5hdi5hbmltYXRpb24sIHJ1bm5pbmdUcmFuc2l0aW9uOiAnc3RvcCd9O1xuXG4gICAgICAvLyBuZXh0IHBhbmVsIHdlJ3JlIHN3aXRjaGluZyB0byB3aWxsIG9ubHkgYXBwZWFyIGluIERPTSBhZnRlciB0aGUgY2hhbmdlIGRldGVjdGlvbiBpcyBkb25lXG4gICAgICAvLyBhbmQgYHRoaXMuX3BhbmVzYCB3aWxsIGJlIHVwZGF0ZWRcbiAgICAgIHRoaXMuX2NkLmRldGVjdENoYW5nZXMoKTtcblxuICAgICAgLy8gZmFkaW5nIG91dFxuICAgICAgaWYgKHRoaXMuX2FjdGl2ZVBhbmUpIHtcbiAgICAgICAgbmdiUnVuVHJhbnNpdGlvbih0aGlzLl9hY3RpdmVQYW5lLmVsUmVmLm5hdGl2ZUVsZW1lbnQsIG5nYk5hdkZhZGVPdXRUcmFuc2l0aW9uLCBvcHRpb25zKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGFjdGl2ZUl0ZW0gPSB0aGlzLl9hY3RpdmVQYW5lID8uaXRlbTtcblxuICAgICAgICAgIHRoaXMuX2FjdGl2ZVBhbmUgPSB0aGlzLl9nZXRQYW5lRm9ySXRlbShuZXh0SXRlbSk7XG5cbiAgICAgICAgICAvLyBmYWRpbmcgaW5cbiAgICAgICAgICBpZiAodGhpcy5fYWN0aXZlUGFuZSkge1xuICAgICAgICAgICAgY29uc3QgZmFkZUluVHJhbnNpdGlvbiA9IHRoaXMubmF2LmFuaW1hdGlvbiA/IG5nYk5hdkZhZGVJblRyYW5zaXRpb24gOiBuZ2JOYXZGYWRlSW5Ob1JlZmxvd1RyYW5zaXRpb247XG4gICAgICAgICAgICBuZ2JSdW5UcmFuc2l0aW9uKHRoaXMuX2FjdGl2ZVBhbmUuZWxSZWYubmF0aXZlRWxlbWVudCwgZmFkZUluVHJhbnNpdGlvbiwgb3B0aW9ucykuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKG5leHRJdGVtKSB7XG4gICAgICAgICAgICAgICAgbmV4dEl0ZW0uc2hvd24uZW1pdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMubmF2LnNob3duLmVtaXQobmV4dEl0ZW0uaWQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoYWN0aXZlSXRlbSkge1xuICAgICAgICAgICAgYWN0aXZlSXRlbS5oaWRkZW4uZW1pdCgpO1xuICAgICAgICAgICAgdGhpcy5uYXYuaGlkZGVuLmVtaXQoYWN0aXZlSXRlbS5pZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUFjdGl2ZVBhbmUoKTtcbiAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlQWN0aXZlUGFuZSgpIHtcbiAgICB0aGlzLl9hY3RpdmVQYW5lID0gdGhpcy5fZ2V0QWN0aXZlUGFuZSgpO1xuICAgIHRoaXMuX2FjdGl2ZVBhbmUgPy5lbFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICB0aGlzLl9hY3RpdmVQYW5lID8uZWxSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBhbmVGb3JJdGVtKGl0ZW06IE5nYk5hdkl0ZW0gfCBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhbmVzICYmIHRoaXMuX3BhbmVzLmZpbmQocGFuZSA9PiBwYW5lLml0ZW0gPT09IGl0ZW0pIHx8IG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBY3RpdmVQYW5lKCk6IE5nYk5hdlBhbmUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fcGFuZXMgJiYgdGhpcy5fcGFuZXMuZmluZChwYW5lID0+IHBhbmUuaXRlbS5hY3RpdmUpIHx8IG51bGw7XG4gIH1cbn1cbiJdfQ==