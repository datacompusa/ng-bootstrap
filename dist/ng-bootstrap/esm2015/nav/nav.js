import { Attribute, ChangeDetectorRef, ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, Output, TemplateRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isDefined } from '../util/util';
import { NgbNavConfig } from './nav-config';
import { Key } from '../util/key';
const isValidNavId = (id) => isDefined(id) && id !== '';
const ɵ0 = isValidNavId;
let navCounter = 0;
/**
 * This directive must be used to wrap content to be displayed in the nav.
 *
 * @since 5.2.0
 */
export class NgbNavContent {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
NgbNavContent.decorators = [
    { type: Directive, args: [{ selector: 'ng-template[ngbNavContent]' },] }
];
NgbNavContent.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * The directive used to group nav link and related nav content. As well as set nav identifier and some options.
 *
 * @since 5.2.0
 */
export class NgbNavItem {
    constructor(nav, elementRef) {
        this.elementRef = elementRef;
        /**
         * If `true`, the current nav item is disabled and can't be toggled by user.
         *
         * Nevertheless disabled nav can be selected programmatically via the `.select()` method and the `[activeId]` binding.
         */
        this.disabled = false;
        /**
         * An event emitted when the fade in transition is finished on the related nav content
         *
         * @since 8.0.0
         */
        this.shown = new EventEmitter();
        /**
         * An event emitted when the fade out transition is finished on the related nav content
         *
         * @since 8.0.0
         */
        this.hidden = new EventEmitter();
        // TODO: cf https://github.com/angular/angular/issues/30106
        this._nav = nav;
    }
    ngAfterContentChecked() {
        // We are using @ContentChildren instead of @ContentChild as in the Angular version being used
        // only @ContentChildren allows us to specify the {descendants: false} option.
        // Without {descendants: false} we are hitting bugs described in:
        // https://github.com/ng-bootstrap/ng-bootstrap/issues/2240
        this.contentTpl = this.contentTpls.first;
    }
    ngOnInit() {
        if (!isDefined(this.domId)) {
            this.domId = `ngb-nav-${navCounter++}`;
        }
    }
    get active() { return this._nav.activeId === this.id; }
    get id() { return isValidNavId(this._id) ? this._id : this.domId; }
    get panelDomId() { return `${this.domId}-panel`; }
    isPanelInDom() {
        return (isDefined(this.destroyOnHide) ? !this.destroyOnHide : !this._nav.destroyOnHide) || this.active;
    }
}
NgbNavItem.decorators = [
    { type: Directive, args: [{ selector: '[ngbNavItem]', exportAs: 'ngbNavItem', host: { '[class.nav-item]': 'true' } },] }
];
NgbNavItem.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [forwardRef(() => NgbNav),] }] },
    { type: ElementRef }
];
NgbNavItem.propDecorators = {
    destroyOnHide: [{ type: Input }],
    disabled: [{ type: Input }],
    domId: [{ type: Input }],
    _id: [{ type: Input, args: ['ngbNavItem',] }],
    shown: [{ type: Output }],
    hidden: [{ type: Output }],
    contentTpls: [{ type: ContentChildren, args: [NgbNavContent, { descendants: false },] }]
};
/**
 * A nav directive that helps with implementing tabbed navigation components.
 *
 * @since 5.2.0
 */
export class NgbNav {
    constructor(role, config, _cd, _document) {
        this.role = role;
        this._cd = _cd;
        this._document = _document;
        /**
         * The event emitted after the active nav changes
         * The payload of the event is the newly active nav id
         *
         * If you want to prevent nav change, you should use `(navChange)` event
         */
        this.activeIdChange = new EventEmitter();
        /**
         * An event emitted when the fade in transition is finished for one of the items.
         *
         * Payload of the event is the nav id that was just shown.
         *
         * @since 8.0.0
         */
        this.shown = new EventEmitter();
        /**
         * An event emitted when the fade out transition is finished for one of the items.
         *
         * Payload of the event is the nav id that was just hidden.
         *
         * @since 8.0.0
         */
        this.hidden = new EventEmitter();
        this.destroy$ = new Subject();
        this.navItemChange$ = new Subject();
        /**
         * The nav change event emitted right before the nav change happens on user click.
         *
         * This event won't be emitted if nav is changed programmatically via `[activeId]` or `.select()`.
         *
         * See [`NgbNavChangeEvent`](#/components/nav/api#NgbNavChangeEvent) for payload details.
         */
        this.navChange = new EventEmitter();
        this.animation = config.animation;
        this.destroyOnHide = config.destroyOnHide;
        this.orientation = config.orientation;
        this.roles = config.roles;
        this.keyboard = config.keyboard;
    }
    click(item) {
        if (!item.disabled) {
            this._updateActiveId(item.id);
        }
    }
    onKeyDown(event) {
        if (this.roles !== 'tablist' || !this.keyboard) {
            return;
        }
        // tslint:disable-next-line: deprecation
        const key = event.which;
        const enabledLinks = this.links.filter(link => !link.navItem.disabled);
        const { length } = enabledLinks;
        let position = -1;
        enabledLinks.forEach((link, index) => {
            if (link.elRef.nativeElement === this._document.activeElement) {
                position = index;
            }
        });
        if (length) {
            switch (key) {
                case Key.ArrowLeft:
                    if (this.orientation === 'vertical') {
                        return;
                    }
                    position = (position - 1 + length) % length;
                    break;
                case Key.ArrowRight:
                    if (this.orientation === 'vertical') {
                        return;
                    }
                    position = (position + 1) % length;
                    break;
                case Key.ArrowDown:
                    if (this.orientation === 'horizontal') {
                        return;
                    }
                    position = (position + 1) % length;
                    break;
                case Key.ArrowUp:
                    if (this.orientation === 'horizontal') {
                        return;
                    }
                    position = (position - 1 + length) % length;
                    break;
                case Key.Home:
                    position = 0;
                    break;
                case Key.End:
                    position = length - 1;
                    break;
            }
            if (this.keyboard === 'changeWithArrows') {
                this.select(enabledLinks[position].navItem.id);
            }
            enabledLinks[position].elRef.nativeElement.focus();
            event.preventDefault();
        }
    }
    /**
     * Selects the nav with the given id and shows its associated pane.
     * Any other nav that was previously selected becomes unselected and its associated pane is hidden.
     */
    select(id) { this._updateActiveId(id, false); }
    ngAfterContentInit() {
        if (!isDefined(this.activeId)) {
            const nextId = this.items.first ? this.items.first.id : null;
            if (isValidNavId(nextId)) {
                this._updateActiveId(nextId, false);
                this._cd.detectChanges();
            }
        }
        this.items.changes.pipe(takeUntil(this.destroy$)).subscribe(() => this._notifyItemChanged(this.activeId));
    }
    ngOnChanges({ activeId }) {
        if (activeId && !activeId.firstChange) {
            this._notifyItemChanged(activeId.currentValue);
        }
    }
    ngOnDestroy() { this.destroy$.next(); }
    _updateActiveId(nextId, emitNavChange = true) {
        if (this.activeId !== nextId) {
            let defaultPrevented = false;
            if (emitNavChange) {
                this.navChange.emit({ activeId: this.activeId, nextId, preventDefault: () => { defaultPrevented = true; } });
            }
            if (!defaultPrevented) {
                this.activeId = nextId;
                this.activeIdChange.emit(nextId);
                this._notifyItemChanged(nextId);
            }
        }
    }
    _notifyItemChanged(nextItemId) { this.navItemChange$.next(this._getItemById(nextItemId)); }
    _getItemById(itemId) {
        return this.items && this.items.find(item => item.id === itemId) || null;
    }
}
NgbNav.decorators = [
    { type: Directive, args: [{
                selector: '[ngbNav]',
                exportAs: 'ngbNav',
                host: {
                    '[class.nav]': 'true',
                    '[class.flex-column]': `orientation === 'vertical'`,
                    '[attr.aria-orientation]': `orientation === 'vertical' && roles === 'tablist' ? 'vertical' : undefined`,
                    '[attr.role]': `role ? role : roles ? 'tablist' : undefined`,
                    '(keydown.arrowLeft)': 'onKeyDown($event)',
                    '(keydown.arrowRight)': 'onKeyDown($event)',
                    '(keydown.arrowDown)': 'onKeyDown($event)',
                    '(keydown.arrowUp)': 'onKeyDown($event)',
                    '(keydown.Home)': 'onKeyDown($event)',
                    '(keydown.End)': 'onKeyDown($event)'
                }
            },] }
];
NgbNav.ctorParameters = () => [
    { type: String, decorators: [{ type: Attribute, args: ['role',] }] },
    { type: NgbNavConfig },
    { type: ChangeDetectorRef },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
NgbNav.propDecorators = {
    activeId: [{ type: Input }],
    activeIdChange: [{ type: Output }],
    animation: [{ type: Input }],
    destroyOnHide: [{ type: Input }],
    orientation: [{ type: Input }],
    roles: [{ type: Input }],
    keyboard: [{ type: Input }],
    shown: [{ type: Output }],
    hidden: [{ type: Output }],
    items: [{ type: ContentChildren, args: [NgbNavItem,] }],
    links: [{ type: ContentChildren, args: [forwardRef(() => NgbNavLink), { descendants: true },] }],
    navChange: [{ type: Output }]
};
/**
 * A directive to put on the nav link.
 *
 * @since 5.2.0
 */
export class NgbNavLink {
    constructor(role, navItem, nav, elRef) {
        this.role = role;
        this.navItem = navItem;
        this.nav = nav;
        this.elRef = elRef;
    }
    hasNavItemClass() {
        // with alternative markup we have to add `.nav-item` class, because `ngbNavItem` is on the ng-container
        return this.navItem.elementRef.nativeElement.nodeType === Node.COMMENT_NODE;
    }
}
NgbNavLink.decorators = [
    { type: Directive, args: [{
                selector: 'a[ngbNavLink]',
                host: {
                    '[id]': 'navItem.domId',
                    '[class.nav-link]': 'true',
                    '[class.nav-item]': 'hasNavItemClass()',
                    '[attr.role]': `role ? role : nav.roles ? 'tab' : undefined`,
                    'href': '',
                    '[class.active]': 'navItem.active',
                    '[class.disabled]': 'navItem.disabled',
                    '[attr.tabindex]': 'navItem.disabled ? -1 : undefined',
                    '[attr.aria-controls]': 'navItem.isPanelInDom() ? navItem.panelDomId : null',
                    '[attr.aria-selected]': 'navItem.active',
                    '[attr.aria-disabled]': 'navItem.disabled',
                    '(click)': 'nav.click(navItem); $event.preventDefault()'
                }
            },] }
];
NgbNavLink.ctorParameters = () => [
    { type: String, decorators: [{ type: Attribute, args: ['role',] }] },
    { type: NgbNavItem },
    { type: NgbNav },
    { type: ElementRef }
];
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9nYWJyaWVsL0RldmVsb3BtZW50L25nLWJvb3RzdHJhcC9zcmMvIiwic291cmNlcyI6WyJuYXYvbmF2LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFHTCxTQUFTLEVBQ1QsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFHTCxNQUFNLEVBR04sV0FBVyxFQUNaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV6QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUVoQyxNQUFNLFlBQVksR0FBRyxDQUFDLEVBQU8sRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7O0FBRTdELElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztBQWlCbkI7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyxhQUFhO0lBQ3hCLFlBQW1CLFdBQTZCO1FBQTdCLGdCQUFXLEdBQVgsV0FBVyxDQUFrQjtJQUFHLENBQUM7OztZQUZyRCxTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsNEJBQTRCLEVBQUM7OztZQW5DakQsV0FBVzs7QUF5Q2I7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyxVQUFVO0lBbURyQixZQUE4QyxHQUFHLEVBQVMsVUFBMkI7UUFBM0IsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUExQ3JG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RSxrQkFBa0I7b0JBQ3RDLGlCQUFpQixFQUFFLG1DQUFtQztvQkFDdEQsc0JBQXNCLEVBQUUsb0RBQW9EO29CQUM1RSxzQkFBc0IsRUFBRSxnQkFBZ0I7b0JBQ3hDLHNCQUFzQixFQUFFLGtCQUFrQjtvQkFDMUMsU0FBUyxFQUFFLDZDQUE2QztpQkFDekQ7YUFDRjs7O3lDQUdNLFNBQVMsU0FBQyxNQUFNO1lBQXVDLFVBQVU7WUFBYyxNQUFNO1lBbFoxRixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQXR0cmlidXRlLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgZm9yd2FyZFJlZixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxuICBTaW1wbGVDaGFuZ2VzLFxuICBUZW1wbGF0ZVJlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge2lzRGVmaW5lZH0gZnJvbSAnLi4vdXRpbC91dGlsJztcbmltcG9ydCB7TmdiTmF2Q29uZmlnfSBmcm9tICcuL25hdi1jb25maWcnO1xuaW1wb3J0IHtLZXl9IGZyb20gJy4uL3V0aWwva2V5JztcblxuY29uc3QgaXNWYWxpZE5hdklkID0gKGlkOiBhbnkpID0+IGlzRGVmaW5lZChpZCkgJiYgaWQgIT09ICcnO1xuXG5sZXQgbmF2Q291bnRlciA9IDA7XG5cbi8qKlxuICogQ29udGV4dCBwYXNzZWQgdG8gdGhlIG5hdiBjb250ZW50IHRlbXBsYXRlLlxuICpcbiAqIFNlZSBbdGhpcyBkZW1vXSgjL2NvbXBvbmVudHMvbmF2L2V4YW1wbGVzI2tlZXAtY29udGVudCkgYXMgdGhlIGV4YW1wbGUuXG4gKlxuICogQHNpbmNlIDUuMi4wXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmdiTmF2Q29udGVudENvbnRleHQge1xuICAvKipcbiAgICogSWYgYHRydWVgLCBjdXJyZW50IG5hdiBjb250ZW50IGlzIHZpc2libGUgYW5kIGFjdGl2ZVxuICAgKi9cbiAgJGltcGxpY2l0OiBib29sZWFuO1xufVxuXG5cbi8qKlxuICogVGhpcyBkaXJlY3RpdmUgbXVzdCBiZSB1c2VkIHRvIHdyYXAgY29udGVudCB0byBiZSBkaXNwbGF5ZWQgaW4gdGhlIG5hdi5cbiAqXG4gKiBAc2luY2UgNS4yLjBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtuZ2JOYXZDb250ZW50XSd9KVxuZXhwb3J0IGNsYXNzIE5nYk5hdkNvbnRlbnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT4pIHt9XG59XG5cblxuLyoqXG4gKiBUaGUgZGlyZWN0aXZlIHVzZWQgdG8gZ3JvdXAgbmF2IGxpbmsgYW5kIHJlbGF0ZWQgbmF2IGNvbnRlbnQuIEFzIHdlbGwgYXMgc2V0IG5hdiBpZGVudGlmaWVyIGFuZCBzb21lIG9wdGlvbnMuXG4gKlxuICogQHNpbmNlIDUuMi4wXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nYk5hdkl0ZW1dJywgZXhwb3J0QXM6ICduZ2JOYXZJdGVtJywgaG9zdDogeydbY2xhc3MubmF2LWl0ZW1dJzogJ3RydWUnfX0pXG5leHBvcnQgY2xhc3MgTmdiTmF2SXRlbSBpbXBsZW1lbnRzIEFmdGVyQ29udGVudENoZWNrZWQsIE9uSW5pdCB7XG4gIHByaXZhdGUgX25hdjogTmdiTmF2O1xuXG4gIC8qKlxuICAgKiBJZiBgdHJ1ZWAsIG5vbi1hY3RpdmUgY3VycmVudCBuYXYgaXRlbSBjb250ZW50IHdpbGwgYmUgcmVtb3ZlZCBmcm9tIERPTVxuICAgKiBPdGhlcndpc2UgaXQgd2lsbCBqdXN0IGJlIGhpZGRlblxuICAgKi9cbiAgQElucHV0KCkgZGVzdHJveU9uSGlkZTtcblxuICAvKipcbiAgICogSWYgYHRydWVgLCB0aGUgY3VycmVudCBuYXYgaXRlbSBpcyBkaXNhYmxlZCBhbmQgY2FuJ3QgYmUgdG9nZ2xlZCBieSB1c2VyLlxuICAgKlxuICAgKiBOZXZlcnRoZWxlc3MgZGlzYWJsZWQgbmF2IGNhbiBiZSBzZWxlY3RlZCBwcm9ncmFtbWF0aWNhbGx5IHZpYSB0aGUgYC5zZWxlY3QoKWAgbWV0aG9kIGFuZCB0aGUgYFthY3RpdmVJZF1gIGJpbmRpbmcuXG4gICAqL1xuICBASW5wdXQoKSBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGUgaWQgdXNlZCBmb3IgdGhlIERPTSBlbGVtZW50cy5cbiAgICogTXVzdCBiZSB1bmlxdWUgaW5zaWRlIHRoZSBkb2N1bWVudCBpbiBjYXNlIHlvdSBoYXZlIG11bHRpcGxlIGBuZ2JOYXZgcyBvbiB0aGUgcGFnZS5cbiAgICpcbiAgICogQXV0b2dlbmVyYXRlZCBhcyBgbmdiLW5hdi1YWFhgIGlmIG5vdCBwcm92aWRlZC5cbiAgICovXG4gIEBJbnB1dCgpIGRvbUlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBpZCB1c2VkIGFzIGEgbW9kZWwgZm9yIGFjdGl2ZSBuYXYuXG4gICAqIEl0IGNhbiBiZSBhbnl0aGluZywgYnV0IG11c3QgYmUgdW5pcXVlIGluc2lkZSBvbmUgYG5nYk5hdmAuXG4gICAqXG4gICAqIFRoZSBvbmx5IGxpbWl0YXRpb24gaXMgdGhhdCBpdCBpcyBub3QgcG9zc2libGUgdG8gaGF2ZSB0aGUgYCcnYCAoZW1wdHkgc3RyaW5nKSBhcyBpZCxcbiAgICogYmVjYXVzZSBgIG5nYk5hdkl0ZW0gYCwgYG5nYk5hdkl0ZW09JydgIGFuZCBgW25nYk5hdkl0ZW1dPVwiJydcImAgYXJlIGluZGlzdGluZ3Vpc2hhYmxlXG4gICAqL1xuICBASW5wdXQoJ25nYk5hdkl0ZW0nKSBfaWQ6IGFueTtcblxuICAvKipcbiAgICogQW4gZXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBmYWRlIGluIHRyYW5zaXRpb24gaXMgZmluaXNoZWQgb24gdGhlIHJlbGF0ZWQgbmF2IGNvbnRlbnRcbiAgICpcbiAgICogQHNpbmNlIDguMC4wXG4gICAqL1xuICBAT3V0cHV0KCkgc2hvd24gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIEFuIGV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgZmFkZSBvdXQgdHJhbnNpdGlvbiBpcyBmaW5pc2hlZCBvbiB0aGUgcmVsYXRlZCBuYXYgY29udGVudFxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIEBPdXRwdXQoKSBoaWRkZW4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgY29udGVudFRwbDogTmdiTmF2Q29udGVudCB8IG51bGw7XG5cbiAgQENvbnRlbnRDaGlsZHJlbihOZ2JOYXZDb250ZW50LCB7ZGVzY2VuZGFudHM6IGZhbHNlfSkgY29udGVudFRwbHM6IFF1ZXJ5TGlzdDxOZ2JOYXZDb250ZW50PjtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KGZvcndhcmRSZWYoKCkgPT4gTmdiTmF2KSkgbmF2LCBwdWJsaWMgZWxlbWVudFJlZjogRWxlbWVudFJlZjxhbnk+KSB7XG4gICAgLy8gVE9ETzogY2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzAxMDZcbiAgICB0aGlzLl9uYXYgPSBuYXY7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudENoZWNrZWQoKSB7XG4gICAgLy8gV2UgYXJlIHVzaW5nIEBDb250ZW50Q2hpbGRyZW4gaW5zdGVhZCBvZiBAQ29udGVudENoaWxkIGFzIGluIHRoZSBBbmd1bGFyIHZlcnNpb24gYmVpbmcgdXNlZFxuICAgIC8vIG9ubHkgQENvbnRlbnRDaGlsZHJlbiBhbGxvd3MgdXMgdG8gc3BlY2lmeSB0aGUge2Rlc2NlbmRhbnRzOiBmYWxzZX0gb3B0aW9uLlxuICAgIC8vIFdpdGhvdXQge2Rlc2NlbmRhbnRzOiBmYWxzZX0gd2UgYXJlIGhpdHRpbmcgYnVncyBkZXNjcmliZWQgaW46XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXAvaXNzdWVzLzIyNDBcbiAgICB0aGlzLmNvbnRlbnRUcGwgPSB0aGlzLmNvbnRlbnRUcGxzLmZpcnN0O1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgaWYgKCFpc0RlZmluZWQodGhpcy5kb21JZCkpIHtcbiAgICAgIHRoaXMuZG9tSWQgPSBgbmdiLW5hdi0ke25hdkNvdW50ZXIrK31gO1xuICAgIH1cbiAgfVxuXG4gIGdldCBhY3RpdmUoKSB7IHJldHVybiB0aGlzLl9uYXYuYWN0aXZlSWQgPT09IHRoaXMuaWQ7IH1cblxuICBnZXQgaWQoKSB7IHJldHVybiBpc1ZhbGlkTmF2SWQodGhpcy5faWQpID8gdGhpcy5faWQgOiB0aGlzLmRvbUlkOyB9XG5cbiAgZ2V0IHBhbmVsRG9tSWQoKSB7IHJldHVybiBgJHt0aGlzLmRvbUlkfS1wYW5lbGA7IH1cblxuICBpc1BhbmVsSW5Eb20oKSB7XG4gICAgcmV0dXJuIChpc0RlZmluZWQodGhpcy5kZXN0cm95T25IaWRlKSA/ICF0aGlzLmRlc3Ryb3lPbkhpZGUgOiAhdGhpcy5fbmF2LmRlc3Ryb3lPbkhpZGUpIHx8IHRoaXMuYWN0aXZlO1xuICB9XG59XG5cblxuLyoqXG4gKiBBIG5hdiBkaXJlY3RpdmUgdGhhdCBoZWxwcyB3aXRoIGltcGxlbWVudGluZyB0YWJiZWQgbmF2aWdhdGlvbiBjb21wb25lbnRzLlxuICpcbiAqIEBzaW5jZSA1LjIuMFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdiTmF2XScsXG4gIGV4cG9ydEFzOiAnbmdiTmF2JyxcbiAgaG9zdDoge1xuICAgICdbY2xhc3MubmF2XSc6ICd0cnVlJyxcbiAgICAnW2NsYXNzLmZsZXgtY29sdW1uXSc6IGBvcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJ2AsXG4gICAgJ1thdHRyLmFyaWEtb3JpZW50YXRpb25dJzogYG9yaWVudGF0aW9uID09PSAndmVydGljYWwnICYmIHJvbGVzID09PSAndGFibGlzdCcgPyAndmVydGljYWwnIDogdW5kZWZpbmVkYCxcbiAgICAnW2F0dHIucm9sZV0nOiBgcm9sZSA/IHJvbGUgOiByb2xlcyA/ICd0YWJsaXN0JyA6IHVuZGVmaW5lZGAsXG4gICAgJyhrZXlkb3duLmFycm93TGVmdCknOiAnb25LZXlEb3duKCRldmVudCknLFxuICAgICcoa2V5ZG93bi5hcnJvd1JpZ2h0KSc6ICdvbktleURvd24oJGV2ZW50KScsXG4gICAgJyhrZXlkb3duLmFycm93RG93biknOiAnb25LZXlEb3duKCRldmVudCknLFxuICAgICcoa2V5ZG93bi5hcnJvd1VwKSc6ICdvbktleURvd24oJGV2ZW50KScsXG4gICAgJyhrZXlkb3duLkhvbWUpJzogJ29uS2V5RG93bigkZXZlbnQpJyxcbiAgICAnKGtleWRvd24uRW5kKSc6ICdvbktleURvd24oJGV2ZW50KSdcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBOZ2JOYXYgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LFxuICAgIE9uRGVzdHJveSB7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9vcmllbnRhdGlvbjogc3RyaW5nO1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm9sZXM6IGJvb2xlYW4gfCBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBpZCBvZiB0aGUgbmF2IHRoYXQgc2hvdWxkIGJlIGFjdGl2ZVxuICAgKlxuICAgKiBZb3UgY291bGQgYWxzbyB1c2UgdGhlIGAuc2VsZWN0KClgIG1ldGhvZCBhbmQgdGhlIGAobmF2Q2hhbmdlKWAgZXZlbnRcbiAgICovXG4gIEBJbnB1dCgpIGFjdGl2ZUlkOiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSBldmVudCBlbWl0dGVkIGFmdGVyIHRoZSBhY3RpdmUgbmF2IGNoYW5nZXNcbiAgICogVGhlIHBheWxvYWQgb2YgdGhlIGV2ZW50IGlzIHRoZSBuZXdseSBhY3RpdmUgbmF2IGlkXG4gICAqXG4gICAqIElmIHlvdSB3YW50IHRvIHByZXZlbnQgbmF2IGNoYW5nZSwgeW91IHNob3VsZCB1c2UgYChuYXZDaGFuZ2UpYCBldmVudFxuICAgKi9cbiAgQE91dHB1dCgpIGFjdGl2ZUlkQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgLyoqXG4gICAqIElmIGB0cnVlYCwgbmF2IGNoYW5nZSB3aWxsIGJlIGFuaW1hdGVkLlxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIEBJbnB1dCgpIGFuaW1hdGlvbjogYm9vbGVhbjtcblxuICAvKipcbiAgICogSWYgYHRydWVgLCBub24tYWN0aXZlIG5hdiBjb250ZW50IHdpbGwgYmUgcmVtb3ZlZCBmcm9tIERPTVxuICAgKiBPdGhlcndpc2UgaXQgd2lsbCBqdXN0IGJlIGhpZGRlblxuICAgKi9cbiAgQElucHV0KCkgZGVzdHJveU9uSGlkZTtcblxuICAvKipcbiAgICogVGhlIG9yaWVudGF0aW9uIG9mIG5hdnMuXG4gICAqXG4gICAqIFVzaW5nIGB2ZXJ0aWNhbGAgd2lsbCBhbHNvIGFkZCB0aGUgYGFyaWEtb3JpZW50YXRpb25gIGF0dHJpYnV0ZVxuICAgKi9cbiAgQElucHV0KCkgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCc7XG5cbiAgLyoqXG4gICAqIFJvbGUgYXR0cmlidXRlIGdlbmVyYXRpbmcgc3RyYXRlZ3k6XG4gICAqIC0gYGZhbHNlYCAtIG5vIHJvbGUgYXR0cmlidXRlcyB3aWxsIGJlIGdlbmVyYXRlZFxuICAgKiAtIGAndGFibGlzdCdgIC0gJ3RhYmxpc3QnLCAndGFiJyBhbmQgJ3RhYnBhbmVsJyB3aWxsIGJlIGdlbmVyYXRlZCAoZGVmYXVsdClcbiAgICovXG4gIEBJbnB1dCgpIHJvbGVzOiAndGFibGlzdCcgfCBmYWxzZTtcblxuICAvKipcbiAgICogS2V5Ym9hcmQgc3VwcG9ydCBmb3IgbmF2IGZvY3VzL3NlbGVjdGlvbiB1c2luZyBhcnJvdyBrZXlzLlxuICAgKlxuICAgKiAqIGBmYWxzZWAgLSBubyBrZXlib2FyZCBzdXBwb3J0LlxuICAgKiAqIGB0cnVlYCAtIG5hdnMgd2lsbCBiZSBmb2N1c2VkIHVzaW5nIGtleWJvYXJkIGFycm93IGtleXNcbiAgICogKiBgJ2NoYW5nZVdpdGhBcnJvd3MnYCAtICBuYXYgd2lsbCBiZSBzZWxlY3RlZCB1c2luZyBrZXlib2FyZCBhcnJvdyBrZXlzXG4gICAqXG4gICAqIFNlZSB0aGUgW2xpc3Qgb2YgYXZhaWxhYmxlIGtleWJvYXJkIHNob3J0Y3V0c10oIy9jb21wb25lbnRzL25hdi9vdmVydmlldyNrZXlib2FyZC1zaG9ydGN1dHMpLlxuICAgKlxuICAgKiBAc2luY2UgNi4xLjBcbiAqL1xuICBASW5wdXQoKSBrZXlib2FyZDogYm9vbGVhbiB8ICdjaGFuZ2VXaXRoQXJyb3dzJztcblxuICAvKipcbiAgICogQW4gZXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBmYWRlIGluIHRyYW5zaXRpb24gaXMgZmluaXNoZWQgZm9yIG9uZSBvZiB0aGUgaXRlbXMuXG4gICAqXG4gICAqIFBheWxvYWQgb2YgdGhlIGV2ZW50IGlzIHRoZSBuYXYgaWQgdGhhdCB3YXMganVzdCBzaG93bi5cbiAgICpcbiAgICogQHNpbmNlIDguMC4wXG4gICAqL1xuICBAT3V0cHV0KCkgc2hvd24gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICAvKipcbiAgICogQW4gZXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBmYWRlIG91dCB0cmFuc2l0aW9uIGlzIGZpbmlzaGVkIGZvciBvbmUgb2YgdGhlIGl0ZW1zLlxuICAgKlxuICAgKiBQYXlsb2FkIG9mIHRoZSBldmVudCBpcyB0aGUgbmF2IGlkIHRoYXQgd2FzIGp1c3QgaGlkZGVuLlxuICAgKlxuICAgKiBAc2luY2UgOC4wLjBcbiAgICovXG4gIEBPdXRwdXQoKSBoaWRkZW4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICBAQ29udGVudENoaWxkcmVuKE5nYk5hdkl0ZW0pIGl0ZW1zOiBRdWVyeUxpc3Q8TmdiTmF2SXRlbT47XG4gIEBDb250ZW50Q2hpbGRyZW4oZm9yd2FyZFJlZigoKSA9PiBOZ2JOYXZMaW5rKSwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgbGlua3M6IFF1ZXJ5TGlzdDxOZ2JOYXZMaW5rPjtcblxuICBkZXN0cm95JCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIG5hdkl0ZW1DaGFuZ2UkID0gbmV3IFN1YmplY3Q8TmdiTmF2SXRlbSB8IG51bGw+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBAQXR0cmlidXRlKCdyb2xlJykgcHVibGljIHJvbGU6IHN0cmluZywgY29uZmlnOiBOZ2JOYXZDb25maWcsIHByaXZhdGUgX2NkOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgX2RvY3VtZW50OiBhbnkpIHtcbiAgICB0aGlzLmFuaW1hdGlvbiA9IGNvbmZpZy5hbmltYXRpb247XG4gICAgdGhpcy5kZXN0cm95T25IaWRlID0gY29uZmlnLmRlc3Ryb3lPbkhpZGU7XG4gICAgdGhpcy5vcmllbnRhdGlvbiA9IGNvbmZpZy5vcmllbnRhdGlvbjtcbiAgICB0aGlzLnJvbGVzID0gY29uZmlnLnJvbGVzO1xuICAgIHRoaXMua2V5Ym9hcmQgPSBjb25maWcua2V5Ym9hcmQ7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG5hdiBjaGFuZ2UgZXZlbnQgZW1pdHRlZCByaWdodCBiZWZvcmUgdGhlIG5hdiBjaGFuZ2UgaGFwcGVucyBvbiB1c2VyIGNsaWNrLlxuICAgKlxuICAgKiBUaGlzIGV2ZW50IHdvbid0IGJlIGVtaXR0ZWQgaWYgbmF2IGlzIGNoYW5nZWQgcHJvZ3JhbW1hdGljYWxseSB2aWEgYFthY3RpdmVJZF1gIG9yIGAuc2VsZWN0KClgLlxuICAgKlxuICAgKiBTZWUgW2BOZ2JOYXZDaGFuZ2VFdmVudGBdKCMvY29tcG9uZW50cy9uYXYvYXBpI05nYk5hdkNoYW5nZUV2ZW50KSBmb3IgcGF5bG9hZCBkZXRhaWxzLlxuICAgKi9cbiAgQE91dHB1dCgpIG5hdkNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8TmdiTmF2Q2hhbmdlRXZlbnQ+KCk7XG5cbiAgY2xpY2soaXRlbTogTmdiTmF2SXRlbSkge1xuICAgIGlmICghaXRlbS5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5fdXBkYXRlQWN0aXZlSWQoaXRlbS5pZCk7XG4gICAgfVxuICB9XG5cbiAgb25LZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMucm9sZXMgIT09ICd0YWJsaXN0JyB8fCAhdGhpcy5rZXlib2FyZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGRlcHJlY2F0aW9uXG4gICAgY29uc3Qga2V5ID0gZXZlbnQud2hpY2g7XG4gICAgY29uc3QgZW5hYmxlZExpbmtzID0gdGhpcy5saW5rcy5maWx0ZXIobGluayA9PiAhbGluay5uYXZJdGVtLmRpc2FibGVkKTtcbiAgICBjb25zdCB7bGVuZ3RofSA9IGVuYWJsZWRMaW5rcztcblxuICAgIGxldCBwb3NpdGlvbiA9IC0xO1xuXG4gICAgZW5hYmxlZExpbmtzLmZvckVhY2goKGxpbmssIGluZGV4KSA9PiB7XG4gICAgICBpZiAobGluay5lbFJlZi5uYXRpdmVFbGVtZW50ID09PSB0aGlzLl9kb2N1bWVudC5hY3RpdmVFbGVtZW50KSB7XG4gICAgICAgIHBvc2l0aW9uID0gaW5kZXg7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAobGVuZ3RoKSB7XG4gICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlIEtleS5BcnJvd0xlZnQ6XG4gICAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcG9zaXRpb24gPSAocG9zaXRpb24gLSAxICsgbGVuZ3RoKSAlIGxlbmd0aDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXkuQXJyb3dSaWdodDpcbiAgICAgICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwb3NpdGlvbiA9IChwb3NpdGlvbiArIDEpICUgbGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleS5BcnJvd0Rvd246XG4gICAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwb3NpdGlvbiA9IChwb3NpdGlvbiArIDEpICUgbGVuZ3RoO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleS5BcnJvd1VwOlxuICAgICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcG9zaXRpb24gPSAocG9zaXRpb24gLSAxICsgbGVuZ3RoKSAlIGxlbmd0aDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXkuSG9tZTpcbiAgICAgICAgICBwb3NpdGlvbiA9IDA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5LkVuZDpcbiAgICAgICAgICBwb3NpdGlvbiA9IGxlbmd0aCAtIDE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5rZXlib2FyZCA9PT0gJ2NoYW5nZVdpdGhBcnJvd3MnKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0KGVuYWJsZWRMaW5rc1twb3NpdGlvbl0ubmF2SXRlbS5pZCk7XG4gICAgICB9XG4gICAgICBlbmFibGVkTGlua3NbcG9zaXRpb25dLmVsUmVmLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0cyB0aGUgbmF2IHdpdGggdGhlIGdpdmVuIGlkIGFuZCBzaG93cyBpdHMgYXNzb2NpYXRlZCBwYW5lLlxuICAgKiBBbnkgb3RoZXIgbmF2IHRoYXQgd2FzIHByZXZpb3VzbHkgc2VsZWN0ZWQgYmVjb21lcyB1bnNlbGVjdGVkIGFuZCBpdHMgYXNzb2NpYXRlZCBwYW5lIGlzIGhpZGRlbi5cbiAgICovXG4gIHNlbGVjdChpZDogYW55KSB7IHRoaXMuX3VwZGF0ZUFjdGl2ZUlkKGlkLCBmYWxzZSk7IH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgaWYgKCFpc0RlZmluZWQodGhpcy5hY3RpdmVJZCkpIHtcbiAgICAgIGNvbnN0IG5leHRJZCA9IHRoaXMuaXRlbXMuZmlyc3QgPyB0aGlzLml0ZW1zLmZpcnN0LmlkIDogbnVsbDtcbiAgICAgIGlmIChpc1ZhbGlkTmF2SWQobmV4dElkKSkge1xuICAgICAgICB0aGlzLl91cGRhdGVBY3RpdmVJZChuZXh0SWQsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fY2QuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaXRlbXMuY2hhbmdlcy5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSkuc3Vic2NyaWJlKCgpID0+IHRoaXMuX25vdGlmeUl0ZW1DaGFuZ2VkKHRoaXMuYWN0aXZlSWQpKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKHthY3RpdmVJZH06IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBpZiAoYWN0aXZlSWQgJiYgIWFjdGl2ZUlkLmZpcnN0Q2hhbmdlKSB7XG4gICAgICB0aGlzLl9ub3RpZnlJdGVtQ2hhbmdlZChhY3RpdmVJZC5jdXJyZW50VmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkgeyB0aGlzLmRlc3Ryb3kkLm5leHQoKTsgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZUFjdGl2ZUlkKG5leHRJZDogYW55LCBlbWl0TmF2Q2hhbmdlID0gdHJ1ZSkge1xuICAgIGlmICh0aGlzLmFjdGl2ZUlkICE9PSBuZXh0SWQpIHtcbiAgICAgIGxldCBkZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG5cbiAgICAgIGlmIChlbWl0TmF2Q2hhbmdlKSB7XG4gICAgICAgIHRoaXMubmF2Q2hhbmdlLmVtaXQoe2FjdGl2ZUlkOiB0aGlzLmFjdGl2ZUlkLCBuZXh0SWQsIHByZXZlbnREZWZhdWx0OiAoKSA9PiB7IGRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlOyB9fSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICB0aGlzLmFjdGl2ZUlkID0gbmV4dElkO1xuICAgICAgICB0aGlzLmFjdGl2ZUlkQ2hhbmdlLmVtaXQobmV4dElkKTtcbiAgICAgICAgdGhpcy5fbm90aWZ5SXRlbUNoYW5nZWQobmV4dElkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9ub3RpZnlJdGVtQ2hhbmdlZChuZXh0SXRlbUlkOiBhbnkpIHsgdGhpcy5uYXZJdGVtQ2hhbmdlJC5uZXh0KHRoaXMuX2dldEl0ZW1CeUlkKG5leHRJdGVtSWQpKTsgfVxuXG4gIHByaXZhdGUgX2dldEl0ZW1CeUlkKGl0ZW1JZDogYW55KTogTmdiTmF2SXRlbSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLml0ZW1zICYmIHRoaXMuaXRlbXMuZmluZChpdGVtID0+IGl0ZW0uaWQgPT09IGl0ZW1JZCkgfHwgbnVsbDtcbiAgfVxufVxuXG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdG8gcHV0IG9uIHRoZSBuYXYgbGluay5cbiAqXG4gKiBAc2luY2UgNS4yLjBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnYVtuZ2JOYXZMaW5rXScsXG4gIGhvc3Q6IHtcbiAgICAnW2lkXSc6ICduYXZJdGVtLmRvbUlkJyxcbiAgICAnW2NsYXNzLm5hdi1saW5rXSc6ICd0cnVlJyxcbiAgICAnW2NsYXNzLm5hdi1pdGVtXSc6ICdoYXNOYXZJdGVtQ2xhc3MoKScsXG4gICAgJ1thdHRyLnJvbGVdJzogYHJvbGUgPyByb2xlIDogbmF2LnJvbGVzID8gJ3RhYicgOiB1bmRlZmluZWRgLFxuICAgICdocmVmJzogJycsXG4gICAgJ1tjbGFzcy5hY3RpdmVdJzogJ25hdkl0ZW0uYWN0aXZlJyxcbiAgICAnW2NsYXNzLmRpc2FibGVkXSc6ICduYXZJdGVtLmRpc2FibGVkJyxcbiAgICAnW2F0dHIudGFiaW5kZXhdJzogJ25hdkl0ZW0uZGlzYWJsZWQgPyAtMSA6IHVuZGVmaW5lZCcsXG4gICAgJ1thdHRyLmFyaWEtY29udHJvbHNdJzogJ25hdkl0ZW0uaXNQYW5lbEluRG9tKCkgPyBuYXZJdGVtLnBhbmVsRG9tSWQgOiBudWxsJyxcbiAgICAnW2F0dHIuYXJpYS1zZWxlY3RlZF0nOiAnbmF2SXRlbS5hY3RpdmUnLFxuICAgICdbYXR0ci5hcmlhLWRpc2FibGVkXSc6ICduYXZJdGVtLmRpc2FibGVkJyxcbiAgICAnKGNsaWNrKSc6ICduYXYuY2xpY2sobmF2SXRlbSk7ICRldmVudC5wcmV2ZW50RGVmYXVsdCgpJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIE5nYk5hdkxpbmsge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBBdHRyaWJ1dGUoJ3JvbGUnKSBwdWJsaWMgcm9sZTogc3RyaW5nLCBwdWJsaWMgbmF2SXRlbTogTmdiTmF2SXRlbSwgcHVibGljIG5hdjogTmdiTmF2LFxuICAgICAgcHVibGljIGVsUmVmOiBFbGVtZW50UmVmKSB7fVxuXG4gIGhhc05hdkl0ZW1DbGFzcygpIHtcbiAgICAvLyB3aXRoIGFsdGVybmF0aXZlIG1hcmt1cCB3ZSBoYXZlIHRvIGFkZCBgLm5hdi1pdGVtYCBjbGFzcywgYmVjYXVzZSBgbmdiTmF2SXRlbWAgaXMgb24gdGhlIG5nLWNvbnRhaW5lclxuICAgIHJldHVybiB0aGlzLm5hdkl0ZW0uZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50Lm5vZGVUeXBlID09PSBOb2RlLkNPTU1FTlRfTk9ERTtcbiAgfVxufVxuXG5cbi8qKlxuICogVGhlIHBheWxvYWQgb2YgdGhlIGNoYW5nZSBldmVudCBlbWl0dGVkIHJpZ2h0IGJlZm9yZSB0aGUgbmF2IGNoYW5nZSBoYXBwZW5zIG9uIHVzZXIgY2xpY2suXG4gKlxuICogVGhpcyBldmVudCB3b24ndCBiZSBlbWl0dGVkIGlmIG5hdiBpcyBjaGFuZ2VkIHByb2dyYW1tYXRpY2FsbHkgdmlhIGBbYWN0aXZlSWRdYCBvciBgLnNlbGVjdCgpYC5cbiAqXG4gKiBAc2luY2UgNS4yLjBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOZ2JOYXZDaGFuZ2VFdmVudDxUID0gYW55PiB7XG4gIC8qKlxuICAgKiBJZCBvZiB0aGUgY3VycmVudGx5IGFjdGl2ZSBuYXYuXG4gICAqL1xuICBhY3RpdmVJZDogVDtcblxuICAvKipcbiAgICogSWQgb2YgdGhlIG5ld2x5IHNlbGVjdGVkIG5hdi5cbiAgICovXG4gIG5leHRJZDogVDtcblxuICAvKipcbiAgICogRnVuY3Rpb24gdGhhdCB3aWxsIHByZXZlbnQgbmF2IGNoYW5nZSBpZiBjYWxsZWQuXG4gICAqL1xuICBwcmV2ZW50RGVmYXVsdDogKCkgPT4gdm9pZDtcbn1cbiJdfQ==