import { NgbConfig } from '../ngb-config';
/**
 * A configuration service for the [NgbAccordion](#/components/accordion/api#NgbAccordion) component.
 *
 * You can inject this service, typically in your root component, and customize its properties
 * to provide default values for all accordions used in the application.
 */
export declare class NgbAccordionConfig {
    animation: boolean;
    closeOthers: boolean;
    type: string;
    constructor(ngbConfig: NgbConfig);
}
