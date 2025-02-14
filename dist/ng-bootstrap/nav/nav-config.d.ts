import { NgbConfig } from '../ngb-config';
/**
 * A configuration service for the [`NgbNav`](#/components/nav/api#NgbNav) component.
 *
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the navs used in the application.
 *
 * @since 5.2.0
 */
export declare class NgbNavConfig {
    animation: boolean;
    destroyOnHide: boolean;
    orientation: 'horizontal' | 'vertical';
    roles: 'tablist' | false;
    keyboard: boolean | 'changeWithArrows';
    constructor(ngbConfig: NgbConfig);
}
