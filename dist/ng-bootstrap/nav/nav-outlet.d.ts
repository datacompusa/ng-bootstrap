import { AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { NgbNav, NgbNavItem } from './nav';
export declare class NgbNavPane {
    elRef: ElementRef<HTMLElement>;
    item: NgbNavItem;
    nav: NgbNav;
    role: string;
    constructor(elRef: ElementRef<HTMLElement>);
}
/**
 * The outlet where currently active nav content will be displayed.
 *
 * @since 5.2.0
 */
export declare class NgbNavOutlet implements AfterViewInit {
    private _cd;
    private _activePane;
    private _panes;
    /**
     * A role to set on the nav pane
     */
    paneRole: any;
    /**
     * Reference to the `NgbNav`
     */
    nav: NgbNav;
    constructor(_cd: ChangeDetectorRef);
    isPanelTransitioning(item: NgbNavItem): boolean;
    ngAfterViewInit(): void;
    private _updateActivePane;
    private _getPaneForItem;
    private _getActivePane;
}
