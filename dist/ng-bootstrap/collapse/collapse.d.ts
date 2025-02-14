import { ElementRef, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgbCollapseConfig } from './collapse-config';
/**
 * A directive to provide a simple way of hiding and showing elements on the page.
 */
export declare class NgbCollapse implements OnInit, OnChanges {
    private _element;
    /**
     * If `true`, collapse will be animated.
     *
     * Animation is triggered only when clicked on triggering element
     * or via the `.toggle()` function
     *
     * @since 8.0.0
     */
    animation: boolean;
    /**
     * If `true`, will collapse the element or show it otherwise.
     */
    collapsed: boolean;
    ngbCollapseChange: EventEmitter<boolean>;
    /**
     * An event emitted when the collapse element is shown, after the transition. It has no payload.
     *
     * @since 8.0.0
     */
    shown: EventEmitter<void>;
    /**
     * An event emitted when the collapse element is hidden, after the transition. It has no payload.
     *
     * @since 8.0.0
     */
    hidden: EventEmitter<void>;
    constructor(_element: ElementRef, config: NgbCollapseConfig);
    ngOnInit(): void;
    ngOnChanges({ collapsed }: SimpleChanges): void;
    /**
     * Triggers collapsing programmatically.
     *
     * If there is a collapsing transition running already, it will be reversed.
     * If the animations are turned off this happens synchronously.
     *
     * @since 8.0.0
     */
    toggle(open?: boolean): void;
    private _runTransition;
}
