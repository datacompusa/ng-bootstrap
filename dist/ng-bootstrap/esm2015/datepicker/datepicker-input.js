import { ChangeDetectorRef, ComponentFactoryResolver, Directive, ElementRef, EventEmitter, forwardRef, Inject, Input, NgZone, Output, Renderer2, ViewContainerRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ngbAutoClose } from '../util/autoclose';
import { ngbFocusTrap } from '../util/focus-trap';
import { positionElements } from '../util/positioning';
import { NgbDateAdapter } from './adapters/ngb-date-adapter';
import { NgbDatepicker } from './datepicker';
import { NgbCalendar } from './ngb-calendar';
import { NgbDate } from './ngb-date';
import { NgbDateParserFormatter } from './ngb-date-parser-formatter';
import { NgbInputDatepickerConfig } from './datepicker-input-config';
import { NgbDatepickerConfig } from './datepicker-config';
import { isString } from '../util/util';
/**
 * A directive that allows to stick a datepicker popup to an input field.
 *
 * Manages interaction with the input field itself, does value formatting and provides forms integration.
 */
export class NgbInputDatepicker {
    constructor(_parserFormatter, _elRef, _vcRef, _renderer, _cfr, _ngZone, _calendar, _dateAdapter, _document, _changeDetector, config) {
        this._parserFormatter = _parserFormatter;
        this._elRef = _elRef;
        this._vcRef = _vcRef;
        this._renderer = _renderer;
        this._cfr = _cfr;
        this._ngZone = _ngZone;
        this._calendar = _calendar;
        this._dateAdapter = _dateAdapter;
        this._document = _document;
        this._changeDetector = _changeDetector;
        this._cRef = null;
        this._disabled = false;
        this._elWithFocus = null;
        this._model = null;
        /**
         * An event emitted when user selects a date using keyboard or mouse.
         *
         * The payload of the event is currently selected `NgbDate`.
         *
         * @since 1.1.1
         */
        this.dateSelect = new EventEmitter();
        /**
         * Event emitted right after the navigation happens and displayed month changes.
         *
         * See [`NgbDatepickerNavigateEvent`](#/components/datepicker/api#NgbDatepickerNavigateEvent) for the payload info.
         */
        this.navigate = new EventEmitter();
        /**
         * An event fired after closing datepicker window.
         *
         * @since 4.2.0
         */
        this.closed = new EventEmitter();
        this._onChange = (_) => { };
        this._onTouched = () => { };
        this._validatorChange = () => { };
        ['autoClose', 'container', 'positionTarget', 'placement'].forEach(input => this[input] = config[input]);
        this._zoneSubscription = _ngZone.onStable.subscribe(() => this._updatePopupPosition());
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = value === '' || (value && value !== 'false');
        if (this.isOpen()) {
            this._cRef.instance.setDisabledState(this._disabled);
        }
    }
    registerOnChange(fn) { this._onChange = fn; }
    registerOnTouched(fn) { this._onTouched = fn; }
    registerOnValidatorChange(fn) { this._validatorChange = fn; }
    setDisabledState(isDisabled) { this.disabled = isDisabled; }
    validate(c) {
        const { value } = c;
        if (value != null) {
            const ngbDate = this._fromDateStruct(this._dateAdapter.fromModel(value));
            if (!ngbDate) {
                return { 'ngbDate': { invalid: value } };
            }
            if (this.minDate && ngbDate.before(NgbDate.from(this.minDate))) {
                return { 'ngbDate': { minDate: { minDate: this.minDate, actual: value } } };
            }
            if (this.maxDate && ngbDate.after(NgbDate.from(this.maxDate))) {
                return { 'ngbDate': { maxDate: { maxDate: this.maxDate, actual: value } } };
            }
        }
        return null;
    }
    writeValue(value) {
        this._model = this._fromDateStruct(this._dateAdapter.fromModel(value));
        this._writeModelValue(this._model);
    }
    manualDateChange(value, updateView = false) {
        const inputValueChanged = value !== this._inputValue;
        if (inputValueChanged) {
            this._inputValue = value;
            this._model = this._fromDateStruct(this._parserFormatter.parse(value));
        }
        if (inputValueChanged || !updateView) {
            this._onChange(this._model ? this._dateAdapter.toModel(this._model) : (value === '' ? null : value));
        }
        if (updateView && this._model) {
            this._writeModelValue(this._model);
        }
    }
    isOpen() { return !!this._cRef; }
    /**
     * Opens the datepicker popup.
     *
     * If the related form control contains a valid date, the corresponding month will be opened.
     */
    open() {
        if (!this.isOpen()) {
            const cf = this._cfr.resolveComponentFactory(NgbDatepicker);
            this._cRef = this._vcRef.createComponent(cf);
            this._applyPopupStyling(this._cRef.location.nativeElement);
            this._applyDatepickerInputs(this._cRef.instance);
            this._subscribeForDatepickerOutputs(this._cRef.instance);
            this._cRef.instance.ngOnInit();
            this._cRef.instance.writeValue(this._dateAdapter.toModel(this._model));
            // date selection event handling
            this._cRef.instance.registerOnChange((selectedDate) => {
                this.writeValue(selectedDate);
                this._onChange(selectedDate);
                this._onTouched();
            });
            this._cRef.changeDetectorRef.detectChanges();
            this._cRef.instance.setDisabledState(this.disabled);
            if (this.container === 'body') {
                this._document.querySelector(this.container).appendChild(this._cRef.location.nativeElement);
            }
            // focus handling
            this._elWithFocus = this._document.activeElement;
            ngbFocusTrap(this._ngZone, this._cRef.location.nativeElement, this.closed, true);
            this._cRef.instance.focus();
            ngbAutoClose(this._ngZone, this._document, this.autoClose, () => this.close(), this.closed, [], [this._elRef.nativeElement, this._cRef.location.nativeElement]);
        }
    }
    /**
     * Closes the datepicker popup.
     */
    close() {
        if (this.isOpen()) {
            this._vcRef.remove(this._vcRef.indexOf(this._cRef.hostView));
            this._cRef = null;
            this.closed.emit();
            this._changeDetector.markForCheck();
            // restore focus
            let elementToFocus = this._elWithFocus;
            if (isString(this.restoreFocus)) {
                elementToFocus = this._document.querySelector(this.restoreFocus);
            }
            else if (this.restoreFocus !== undefined) {
                elementToFocus = this.restoreFocus;
            }
            // in IE document.activeElement can contain an object without 'focus()' sometimes
            if (elementToFocus && elementToFocus['focus']) {
                elementToFocus.focus();
            }
            else {
                this._document.body.focus();
            }
        }
    }
    /**
     * Toggles the datepicker popup.
     */
    toggle() {
        if (this.isOpen()) {
            this.close();
        }
        else {
            this.open();
        }
    }
    /**
     * Navigates to the provided date.
     *
     * With the default calendar we use ISO 8601: 'month' is 1=Jan ... 12=Dec.
     * If nothing or invalid date provided calendar will open current month.
     *
     * Use the `[startDate]` input as an alternative.
     */
    navigateTo(date) {
        if (this.isOpen()) {
            this._cRef.instance.navigateTo(date);
        }
    }
    onBlur() { this._onTouched(); }
    onFocus() { this._elWithFocus = this._elRef.nativeElement; }
    ngOnChanges(changes) {
        if (changes['minDate'] || changes['maxDate']) {
            this._validatorChange();
            if (this.isOpen()) {
                if (changes['minDate']) {
                    this._cRef.instance.minDate = this.minDate;
                }
                if (changes['maxDate']) {
                    this._cRef.instance.maxDate = this.maxDate;
                }
                this._cRef.instance.ngOnChanges(changes);
            }
        }
    }
    ngOnDestroy() {
        this.close();
        this._zoneSubscription.unsubscribe();
    }
    _applyDatepickerInputs(datepickerInstance) {
        ['dayTemplate', 'dayTemplateData', 'displayMonths', 'firstDayOfWeek', 'footerTemplate', 'markDisabled', 'minDate',
            'maxDate', 'navigation', 'outsideDays', 'showNavigation', 'showWeekdays', 'showWeekNumbers']
            .forEach((optionName) => {
            if (this[optionName] !== undefined) {
                datepickerInstance[optionName] = this[optionName];
            }
        });
        datepickerInstance.startDate = this.startDate || this._model;
    }
    _applyPopupStyling(nativeElement) {
        this._renderer.addClass(nativeElement, 'dropdown-menu');
        this._renderer.addClass(nativeElement, 'show');
        if (this.container === 'body') {
            this._renderer.addClass(nativeElement, 'ngb-dp-body');
        }
    }
    _subscribeForDatepickerOutputs(datepickerInstance) {
        datepickerInstance.navigate.subscribe(navigateEvent => this.navigate.emit(navigateEvent));
        datepickerInstance.dateSelect.subscribe(date => {
            this.dateSelect.emit(date);
            if (this.autoClose === true || this.autoClose === 'inside') {
                this.close();
            }
        });
    }
    _writeModelValue(model) {
        const value = this._parserFormatter.format(model);
        this._inputValue = value;
        this._renderer.setProperty(this._elRef.nativeElement, 'value', value);
        if (this.isOpen()) {
            this._cRef.instance.writeValue(this._dateAdapter.toModel(model));
            this._onTouched();
        }
    }
    _fromDateStruct(date) {
        const ngbDate = date ? new NgbDate(date.year, date.month, date.day) : null;
        return this._calendar.isValid(ngbDate) ? ngbDate : null;
    }
    _updatePopupPosition() {
        if (!this._cRef) {
            return;
        }
        let hostElement;
        if (isString(this.positionTarget)) {
            hostElement = this._document.querySelector(this.positionTarget);
        }
        else if (this.positionTarget instanceof HTMLElement) {
            hostElement = this.positionTarget;
        }
        else {
            hostElement = this._elRef.nativeElement;
        }
        if (this.positionTarget && !hostElement) {
            throw new Error('ngbDatepicker could not find element declared in [positionTarget] to position against.');
        }
        positionElements(hostElement, this._cRef.location.nativeElement, this.placement, this.container === 'body');
    }
}
NgbInputDatepicker.decorators = [
    { type: Directive, args: [{
                selector: 'input[ngbDatepicker]',
                exportAs: 'ngbDatepicker',
                host: {
                    '(input)': 'manualDateChange($event.target.value)',
                    '(change)': 'manualDateChange($event.target.value, true)',
                    '(focus)': 'onFocus()',
                    '(blur)': 'onBlur()',
                    '[disabled]': 'disabled'
                },
                providers: [
                    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbInputDatepicker), multi: true },
                    { provide: NG_VALIDATORS, useExisting: forwardRef(() => NgbInputDatepicker), multi: true },
                    { provide: NgbDatepickerConfig, useExisting: NgbInputDatepickerConfig }
                ],
            },] }
];
NgbInputDatepicker.ctorParameters = () => [
    { type: NgbDateParserFormatter },
    { type: ElementRef },
    { type: ViewContainerRef },
    { type: Renderer2 },
    { type: ComponentFactoryResolver },
    { type: NgZone },
    { type: NgbCalendar },
    { type: NgbDateAdapter },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: ChangeDetectorRef },
    { type: NgbInputDatepickerConfig }
];
NgbInputDatepicker.propDecorators = {
    autoClose: [{ type: Input }],
    dayTemplate: [{ type: Input }],
    dayTemplateData: [{ type: Input }],
    displayMonths: [{ type: Input }],
    firstDayOfWeek: [{ type: Input }],
    footerTemplate: [{ type: Input }],
    markDisabled: [{ type: Input }],
    minDate: [{ type: Input }],
    maxDate: [{ type: Input }],
    navigation: [{ type: Input }],
    outsideDays: [{ type: Input }],
    placement: [{ type: Input }],
    restoreFocus: [{ type: Input }],
    showWeekdays: [{ type: Input }],
    showWeekNumbers: [{ type: Input }],
    startDate: [{ type: Input }],
    container: [{ type: Input }],
    positionTarget: [{ type: Input }],
    dateSelect: [{ type: Output }],
    navigate: [{ type: Output }],
    closed: [{ type: Output }],
    disabled: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnB1dC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvZ2FicmllbC9EZXZlbG9wbWVudC9uZy1ib290c3RyYXAvc3JjLyIsInNvdXJjZXMiOlsiZGF0ZXBpY2tlci9kYXRlcGlja2VyLWlucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxpQkFBaUIsRUFDakIsd0JBQXdCLEVBRXhCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFHTixNQUFNLEVBQ04sU0FBUyxFQUdULGdCQUFnQixFQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUdMLGFBQWEsRUFDYixpQkFBaUIsRUFHbEIsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDL0MsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ2hELE9BQU8sRUFBaUIsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUVyRSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDM0QsT0FBTyxFQUFDLGFBQWEsRUFBNkIsTUFBTSxjQUFjLENBQUM7QUFFdkUsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzNDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFFbkUsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDbkUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDeEQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWMs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QUNULEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO29CQUM1RixFQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUM7b0JBQ3hGLEVBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBQztpQkFDdEU7YUFDRjs7O1lBMUJPLHNCQUFzQjtZQWpDNUIsVUFBVTtZQVlWLGdCQUFnQjtZQUhoQixTQUFTO1lBWlQsd0JBQXdCO1lBUXhCLE1BQU07WUEwQkEsV0FBVztZQUhYLGNBQWM7NENBb1BmLE1BQU0sU0FBQyxRQUFRO1lBcFJwQixpQkFBaUI7WUF1Q1gsd0JBQXdCOzs7d0JBaUQ3QixLQUFLOzBCQVNMLEtBQUs7OEJBVUwsS0FBSzs0QkFLTCxLQUFLOzZCQU9MLEtBQUs7NkJBT0wsS0FBSzsyQkFTTCxLQUFLO3NCQU9MLEtBQUs7c0JBT0wsS0FBSzt5QkFTTCxLQUFLOzBCQVdMLEtBQUs7d0JBZUwsS0FBSzsyQkFVTCxLQUFLOzJCQUtMLEtBQUs7OEJBS0wsS0FBSzt3QkFVTCxLQUFLO3dCQU9MLEtBQUs7NkJBU0wsS0FBSzt5QkFTTCxNQUFNO3VCQU9OLE1BQU07cUJBT04sTUFBTTt1QkFFTixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgQ29tcG9uZW50UmVmLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgZm9yd2FyZFJlZixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT3V0cHV0LFxuICBSZW5kZXJlcjIsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q29udGFpbmVyUmVmXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIEFic3RyYWN0Q29udHJvbCxcbiAgQ29udHJvbFZhbHVlQWNjZXNzb3IsXG4gIE5HX1ZBTElEQVRPUlMsXG4gIE5HX1ZBTFVFX0FDQ0VTU09SLFxuICBWYWxpZGF0aW9uRXJyb3JzLFxuICBWYWxpZGF0b3Jcbn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQge25nYkF1dG9DbG9zZX0gZnJvbSAnLi4vdXRpbC9hdXRvY2xvc2UnO1xuaW1wb3J0IHtuZ2JGb2N1c1RyYXB9IGZyb20gJy4uL3V0aWwvZm9jdXMtdHJhcCc7XG5pbXBvcnQge1BsYWNlbWVudEFycmF5LCBwb3NpdGlvbkVsZW1lbnRzfSBmcm9tICcuLi91dGlsL3Bvc2l0aW9uaW5nJztcblxuaW1wb3J0IHtOZ2JEYXRlQWRhcHRlcn0gZnJvbSAnLi9hZGFwdGVycy9uZ2ItZGF0ZS1hZGFwdGVyJztcbmltcG9ydCB7TmdiRGF0ZXBpY2tlciwgTmdiRGF0ZXBpY2tlck5hdmlnYXRlRXZlbnR9IGZyb20gJy4vZGF0ZXBpY2tlcic7XG5pbXBvcnQge0RheVRlbXBsYXRlQ29udGV4dH0gZnJvbSAnLi9kYXRlcGlja2VyLWRheS10ZW1wbGF0ZS1jb250ZXh0JztcbmltcG9ydCB7TmdiQ2FsZW5kYXJ9IGZyb20gJy4vbmdiLWNhbGVuZGFyJztcbmltcG9ydCB7TmdiRGF0ZX0gZnJvbSAnLi9uZ2ItZGF0ZSc7XG5pbXBvcnQge05nYkRhdGVQYXJzZXJGb3JtYXR0ZXJ9IGZyb20gJy4vbmdiLWRhdGUtcGFyc2VyLWZvcm1hdHRlcic7XG5pbXBvcnQge05nYkRhdGVTdHJ1Y3R9IGZyb20gJy4vbmdiLWRhdGUtc3RydWN0JztcbmltcG9ydCB7TmdiSW5wdXREYXRlcGlja2VyQ29uZmlnfSBmcm9tICcuL2RhdGVwaWNrZXItaW5wdXQtY29uZmlnJztcbmltcG9ydCB7TmdiRGF0ZXBpY2tlckNvbmZpZ30gZnJvbSAnLi9kYXRlcGlja2VyLWNvbmZpZyc7XG5pbXBvcnQge2lzU3RyaW5nfSBmcm9tICcuLi91dGlsL3V0aWwnO1xuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRoYXQgYWxsb3dzIHRvIHN0aWNrIGEgZGF0ZXBpY2tlciBwb3B1cCB0byBhbiBpbnB1dCBmaWVsZC5cbiAqXG4gKiBNYW5hZ2VzIGludGVyYWN0aW9uIHdpdGggdGhlIGlucHV0IGZpZWxkIGl0c2VsZiwgZG9lcyB2YWx1ZSBmb3JtYXR0aW5nIGFuZCBwcm92aWRlcyBmb3JtcyBpbnRlZ3JhdGlvbi5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnaW5wdXRbbmdiRGF0ZXBpY2tlcl0nLFxuICBleHBvcnRBczogJ25nYkRhdGVwaWNrZXInLFxuICBob3N0OiB7XG4gICAgJyhpbnB1dCknOiAnbWFudWFsRGF0ZUNoYW5nZSgkZXZlbnQudGFyZ2V0LnZhbHVlKScsXG4gICAgJyhjaGFuZ2UpJzogJ21hbnVhbERhdGVDaGFuZ2UoJGV2ZW50LnRhcmdldC52YWx1ZSwgdHJ1ZSknLFxuICAgICcoZm9jdXMpJzogJ29uRm9jdXMoKScsXG4gICAgJyhibHVyKSc6ICdvbkJsdXIoKScsXG4gICAgJ1tkaXNhYmxlZF0nOiAnZGlzYWJsZWQnXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIHtwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUiwgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmdiSW5wdXREYXRlcGlja2VyKSwgbXVsdGk6IHRydWV9LFxuICAgIHtwcm92aWRlOiBOR19WQUxJREFUT1JTLCB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ2JJbnB1dERhdGVwaWNrZXIpLCBtdWx0aTogdHJ1ZX0sXG4gICAge3Byb3ZpZGU6IE5nYkRhdGVwaWNrZXJDb25maWcsIHVzZUV4aXN0aW5nOiBOZ2JJbnB1dERhdGVwaWNrZXJDb25maWd9XG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIE5nYklucHV0RGF0ZXBpY2tlciBpbXBsZW1lbnRzIE9uQ2hhbmdlcyxcbiAgICBPbkRlc3Ryb3ksIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBWYWxpZGF0b3Ige1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b0Nsb3NlOiBib29sZWFuIHwgc3RyaW5nO1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IGJvb2xlYW4gfCAnJztcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX25hdmlnYXRpb246IHN0cmluZztcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX291dHNpZGVEYXlzOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBfY1JlZjogQ29tcG9uZW50UmVmPE5nYkRhdGVwaWNrZXI+fCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfZWxXaXRoRm9jdXM6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX21vZGVsOiBOZ2JEYXRlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2lucHV0VmFsdWU6IHN0cmluZztcbiAgcHJpdmF0ZSBfem9uZVN1YnNjcmlwdGlvbjogYW55O1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgZGF0ZXBpY2tlciBwb3B1cCBzaG91bGQgYmUgY2xvc2VkIGF1dG9tYXRpY2FsbHkgYWZ0ZXIgZGF0ZSBzZWxlY3Rpb24gLyBvdXRzaWRlIGNsaWNrIG9yIG5vdC5cbiAgICpcbiAgICogKiBgdHJ1ZWAgLSB0aGUgcG9wdXAgd2lsbCBjbG9zZSBvbiBib3RoIGRhdGUgc2VsZWN0aW9uIGFuZCBvdXRzaWRlIGNsaWNrLlxuICAgKiAqIGBmYWxzZWAgLSB0aGUgcG9wdXAgY2FuIG9ubHkgYmUgY2xvc2VkIG1hbnVhbGx5IHZpYSBgY2xvc2UoKWAgb3IgYHRvZ2dsZSgpYCBtZXRob2RzLlxuICAgKiAqIGBcImluc2lkZVwiYCAtIHRoZSBwb3B1cCB3aWxsIGNsb3NlIG9uIGRhdGUgc2VsZWN0aW9uLCBidXQgbm90IG91dHNpZGUgY2xpY2tzLlxuICAgKiAqIGBcIm91dHNpZGVcImAgLSB0aGUgcG9wdXAgd2lsbCBjbG9zZSBvbmx5IG9uIHRoZSBvdXRzaWRlIGNsaWNrIGFuZCBub3Qgb24gZGF0ZSBzZWxlY3Rpb24vaW5zaWRlIGNsaWNrcy5cbiAgICpcbiAgICogQHNpbmNlIDMuMC4wXG4gICAqL1xuICBASW5wdXQoKSBhdXRvQ2xvc2U6IGJvb2xlYW4gfCAnaW5zaWRlJyB8ICdvdXRzaWRlJztcblxuICAvKipcbiAgICogVGhlIHJlZmVyZW5jZSB0byBhIGN1c3RvbSB0ZW1wbGF0ZSBmb3IgdGhlIGRheS5cbiAgICpcbiAgICogQWxsb3dzIHRvIGNvbXBsZXRlbHkgb3ZlcnJpZGUgdGhlIHdheSBhIGRheSAnY2VsbCcgaW4gdGhlIGNhbGVuZGFyIGlzIGRpc3BsYXllZC5cbiAgICpcbiAgICogU2VlIFtgRGF5VGVtcGxhdGVDb250ZXh0YF0oIy9jb21wb25lbnRzL2RhdGVwaWNrZXIvYXBpI0RheVRlbXBsYXRlQ29udGV4dCkgZm9yIHRoZSBkYXRhIHlvdSBnZXQgaW5zaWRlLlxuICAgKi9cbiAgQElucHV0KCkgZGF5VGVtcGxhdGU6IFRlbXBsYXRlUmVmPERheVRlbXBsYXRlQ29udGV4dD47XG5cbiAgLyoqXG4gICAqIFRoZSBjYWxsYmFjayB0byBwYXNzIGFueSBhcmJpdHJhcnkgZGF0YSB0byB0aGUgdGVtcGxhdGUgY2VsbCB2aWEgdGhlXG4gICAqIFtgRGF5VGVtcGxhdGVDb250ZXh0YF0oIy9jb21wb25lbnRzL2RhdGVwaWNrZXIvYXBpI0RheVRlbXBsYXRlQ29udGV4dCkncyBgZGF0YWAgcGFyYW1ldGVyLlxuICAgKlxuICAgKiBgY3VycmVudGAgaXMgdGhlIG1vbnRoIHRoYXQgaXMgY3VycmVudGx5IGRpc3BsYXllZCBieSB0aGUgZGF0ZXBpY2tlci5cbiAgICpcbiAgICogQHNpbmNlIDMuMy4wXG4gICAqL1xuICBASW5wdXQoKSBkYXlUZW1wbGF0ZURhdGE6IChkYXRlOiBOZ2JEYXRlLCBjdXJyZW50Pzoge3llYXI6IG51bWJlciwgbW9udGg6IG51bWJlcn0pID0+IGFueTtcblxuICAvKipcbiAgICogVGhlIG51bWJlciBvZiBtb250aHMgdG8gZGlzcGxheS5cbiAgICovXG4gIEBJbnB1dCgpIGRpc3BsYXlNb250aHM6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGZpcnN0IGRheSBvZiB0aGUgd2Vlay5cbiAgICpcbiAgICogV2l0aCBkZWZhdWx0IGNhbGVuZGFyIHdlIHVzZSBJU08gODYwMTogJ3dlZWtkYXknIGlzIDE9TW9uIC4uLiA3PVN1bi5cbiAgICovXG4gIEBJbnB1dCgpIGZpcnN0RGF5T2ZXZWVrOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSByZWZlcmVuY2UgdG8gdGhlIGN1c3RvbSB0ZW1wbGF0ZSBmb3IgdGhlIGRhdGVwaWNrZXIgZm9vdGVyLlxuICAgKlxuICAgKiBAc2luY2UgMy4zLjBcbiAgICovXG4gIEBJbnB1dCgpIGZvb3RlclRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gIC8qKlxuICAgKiBUaGUgY2FsbGJhY2sgdG8gbWFyayBzb21lIGRhdGVzIGFzIGRpc2FibGVkLlxuICAgKlxuICAgKiBJdCBpcyBjYWxsZWQgZm9yIGVhY2ggbmV3IGRhdGUgd2hlbiBuYXZpZ2F0aW5nIHRvIGEgZGlmZmVyZW50IG1vbnRoLlxuICAgKlxuICAgKiBgY3VycmVudGAgaXMgdGhlIG1vbnRoIHRoYXQgaXMgY3VycmVudGx5IGRpc3BsYXllZCBieSB0aGUgZGF0ZXBpY2tlci5cbiAgICovXG4gIEBJbnB1dCgpIG1hcmtEaXNhYmxlZDogKGRhdGU6IE5nYkRhdGUsIGN1cnJlbnQ/OiB7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyfSkgPT4gYm9vbGVhbjtcblxuICAvKipcbiAgICogVGhlIGVhcmxpZXN0IGRhdGUgdGhhdCBjYW4gYmUgZGlzcGxheWVkIG9yIHNlbGVjdGVkLiBBbHNvIHVzZWQgZm9yIGZvcm0gdmFsaWRhdGlvbi5cbiAgICpcbiAgICogSWYgbm90IHByb3ZpZGVkLCAneWVhcicgc2VsZWN0IGJveCB3aWxsIGRpc3BsYXkgMTAgeWVhcnMgYmVmb3JlIHRoZSBjdXJyZW50IG1vbnRoLlxuICAgKi9cbiAgQElucHV0KCkgbWluRGF0ZTogTmdiRGF0ZVN0cnVjdDtcblxuICAvKipcbiAgICogVGhlIGxhdGVzdCBkYXRlIHRoYXQgY2FuIGJlIGRpc3BsYXllZCBvciBzZWxlY3RlZC4gQWxzbyB1c2VkIGZvciBmb3JtIHZhbGlkYXRpb24uXG4gICAqXG4gICAqIElmIG5vdCBwcm92aWRlZCwgJ3llYXInIHNlbGVjdCBib3ggd2lsbCBkaXNwbGF5IDEwIHllYXJzIGFmdGVyIHRoZSBjdXJyZW50IG1vbnRoLlxuICAgKi9cbiAgQElucHV0KCkgbWF4RGF0ZTogTmdiRGF0ZVN0cnVjdDtcblxuICAvKipcbiAgICogTmF2aWdhdGlvbiB0eXBlLlxuICAgKlxuICAgKiAqIGBcInNlbGVjdFwiYCAtIHNlbGVjdCBib3hlcyBmb3IgbW9udGggYW5kIG5hdmlnYXRpb24gYXJyb3dzXG4gICAqICogYFwiYXJyb3dzXCJgIC0gb25seSBuYXZpZ2F0aW9uIGFycm93c1xuICAgKiAqIGBcIm5vbmVcImAgLSBubyBuYXZpZ2F0aW9uIHZpc2libGUgYXQgYWxsXG4gICAqL1xuICBASW5wdXQoKSBuYXZpZ2F0aW9uOiAnc2VsZWN0JyB8ICdhcnJvd3MnIHwgJ25vbmUnO1xuXG4gIC8qKlxuICAgKiBUaGUgd2F5IG9mIGRpc3BsYXlpbmcgZGF5cyB0aGF0IGRvbid0IGJlbG9uZyB0byB0aGUgY3VycmVudCBtb250aC5cbiAgICpcbiAgICogKiBgXCJ2aXNpYmxlXCJgIC0gZGF5cyBhcmUgdmlzaWJsZVxuICAgKiAqIGBcImhpZGRlblwiYCAtIGRheXMgYXJlIGhpZGRlbiwgd2hpdGUgc3BhY2UgcHJlc2VydmVkXG4gICAqICogYFwiY29sbGFwc2VkXCJgIC0gZGF5cyBhcmUgY29sbGFwc2VkLCBzbyB0aGUgZGF0ZXBpY2tlciBoZWlnaHQgbWlnaHQgY2hhbmdlIGJldHdlZW4gbW9udGhzXG4gICAqXG4gICAqIEZvciB0aGUgMisgbW9udGhzIHZpZXcsIGRheXMgaW4gYmV0d2VlbiBtb250aHMgYXJlIG5ldmVyIHNob3duLlxuICAgKi9cbiAgQElucHV0KCkgb3V0c2lkZURheXM6ICd2aXNpYmxlJyB8ICdjb2xsYXBzZWQnIHwgJ2hpZGRlbic7XG5cbiAgLyoqXG4gICAqIFRoZSBwcmVmZXJyZWQgcGxhY2VtZW50IG9mIHRoZSBkYXRlcGlja2VyIHBvcHVwLlxuICAgKlxuICAgKiBQb3NzaWJsZSB2YWx1ZXMgYXJlIGBcInRvcFwiYCwgYFwidG9wLWxlZnRcImAsIGBcInRvcC1yaWdodFwiYCwgYFwiYm90dG9tXCJgLCBgXCJib3R0b20tbGVmdFwiYCxcbiAgICogYFwiYm90dG9tLXJpZ2h0XCJgLCBgXCJsZWZ0XCJgLCBgXCJsZWZ0LXRvcFwiYCwgYFwibGVmdC1ib3R0b21cImAsIGBcInJpZ2h0XCJgLCBgXCJyaWdodC10b3BcImAsXG4gICAqIGBcInJpZ2h0LWJvdHRvbVwiYFxuICAgKlxuICAgKiBBY2NlcHRzIGFuIGFycmF5IG9mIHN0cmluZ3Mgb3IgYSBzdHJpbmcgd2l0aCBzcGFjZSBzZXBhcmF0ZWQgcG9zc2libGUgdmFsdWVzLlxuICAgKlxuICAgKiBUaGUgZGVmYXVsdCBvcmRlciBvZiBwcmVmZXJlbmNlIGlzIGBcImJvdHRvbS1sZWZ0IGJvdHRvbS1yaWdodCB0b3AtbGVmdCB0b3AtcmlnaHRcImBcbiAgICpcbiAgICogUGxlYXNlIHNlZSB0aGUgW3Bvc2l0aW9uaW5nIG92ZXJ2aWV3XSgjL3Bvc2l0aW9uaW5nKSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKi9cbiAgQElucHV0KCkgcGxhY2VtZW50OiBQbGFjZW1lbnRBcnJheTtcblxuICAvKipcbiAgICogSWYgYHRydWVgLCB3aGVuIGNsb3NpbmcgZGF0ZXBpY2tlciB3aWxsIGZvY3VzIGVsZW1lbnQgdGhhdCB3YXMgZm9jdXNlZCBiZWZvcmUgZGF0ZXBpY2tlciB3YXMgb3BlbmVkLlxuICAgKlxuICAgKiBBbHRlcm5hdGl2ZWx5IHlvdSBjb3VsZCBwcm92aWRlIGEgc2VsZWN0b3Igb3IgYW4gYEhUTUxFbGVtZW50YCB0byBmb2N1cy4gSWYgdGhlIGVsZW1lbnQgZG9lc24ndCBleGlzdCBvciBpbnZhbGlkLFxuICAgKiB3ZSdsbCBmYWxsYmFjayB0byBmb2N1cyBkb2N1bWVudCBib2R5LlxuICAgKlxuICAgKiBAc2luY2UgNS4yLjBcbiAgICovXG4gIEBJbnB1dCgpIHJlc3RvcmVGb2N1czogdHJ1ZSB8IHN0cmluZyB8IEhUTUxFbGVtZW50O1xuXG4gIC8qKlxuICAgKiBJZiBgdHJ1ZWAsIHdlZWtkYXlzIHdpbGwgYmUgZGlzcGxheWVkLlxuICAgKi9cbiAgQElucHV0KCkgc2hvd1dlZWtkYXlzOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBJZiBgdHJ1ZWAsIHdlZWsgbnVtYmVycyB3aWxsIGJlIGRpc3BsYXllZC5cbiAgICovXG4gIEBJbnB1dCgpIHNob3dXZWVrTnVtYmVyczogYm9vbGVhbjtcblxuICAvKipcbiAgICogVGhlIGRhdGUgdG8gb3BlbiBjYWxlbmRhciB3aXRoLlxuICAgKlxuICAgKiBXaXRoIHRoZSBkZWZhdWx0IGNhbGVuZGFyIHdlIHVzZSBJU08gODYwMTogJ21vbnRoJyBpcyAxPUphbiAuLi4gMTI9RGVjLlxuICAgKiBJZiBub3RoaW5nIG9yIGludmFsaWQgZGF0ZSBpcyBwcm92aWRlZCwgY2FsZW5kYXIgd2lsbCBvcGVuIHdpdGggY3VycmVudCBtb250aC5cbiAgICpcbiAgICogWW91IGNvdWxkIHVzZSBgbmF2aWdhdGVUbyhkYXRlKWAgbWV0aG9kIGFzIGFuIGFsdGVybmF0aXZlLlxuICAgKi9cbiAgQElucHV0KCkgc3RhcnREYXRlOiB7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk/OiBudW1iZXJ9O1xuXG4gIC8qKlxuICAgKiBBIHNlbGVjdG9yIHNwZWNpZnlpbmcgdGhlIGVsZW1lbnQgdGhlIGRhdGVwaWNrZXIgcG9wdXAgc2hvdWxkIGJlIGFwcGVuZGVkIHRvLlxuICAgKlxuICAgKiBDdXJyZW50bHkgb25seSBzdXBwb3J0cyBgXCJib2R5XCJgLlxuICAgKi9cbiAgQElucHV0KCkgY29udGFpbmVyOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEEgY3NzIHNlbGVjdG9yIG9yIGh0bWwgZWxlbWVudCBzcGVjaWZ5aW5nIHRoZSBlbGVtZW50IHRoZSBkYXRlcGlja2VyIHBvcHVwIHNob3VsZCBiZSBwb3NpdGlvbmVkIGFnYWluc3QuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQgdGhlIGlucHV0IGlzIHVzZWQgYXMgYSB0YXJnZXQuXG4gICAqXG4gICAqIEBzaW5jZSA0LjIuMFxuICAgKi9cbiAgQElucHV0KCkgcG9zaXRpb25UYXJnZXQ6IHN0cmluZyB8IEhUTUxFbGVtZW50O1xuXG4gIC8qKlxuICAgKiBBbiBldmVudCBlbWl0dGVkIHdoZW4gdXNlciBzZWxlY3RzIGEgZGF0ZSB1c2luZyBrZXlib2FyZCBvciBtb3VzZS5cbiAgICpcbiAgICogVGhlIHBheWxvYWQgb2YgdGhlIGV2ZW50IGlzIGN1cnJlbnRseSBzZWxlY3RlZCBgTmdiRGF0ZWAuXG4gICAqXG4gICAqIEBzaW5jZSAxLjEuMVxuICAgKi9cbiAgQE91dHB1dCgpIGRhdGVTZWxlY3QgPSBuZXcgRXZlbnRFbWl0dGVyPE5nYkRhdGU+KCk7XG5cbiAgLyoqXG4gICAqIEV2ZW50IGVtaXR0ZWQgcmlnaHQgYWZ0ZXIgdGhlIG5hdmlnYXRpb24gaGFwcGVucyBhbmQgZGlzcGxheWVkIG1vbnRoIGNoYW5nZXMuXG4gICAqXG4gICAqIFNlZSBbYE5nYkRhdGVwaWNrZXJOYXZpZ2F0ZUV2ZW50YF0oIy9jb21wb25lbnRzL2RhdGVwaWNrZXIvYXBpI05nYkRhdGVwaWNrZXJOYXZpZ2F0ZUV2ZW50KSBmb3IgdGhlIHBheWxvYWQgaW5mby5cbiAgICovXG4gIEBPdXRwdXQoKSBuYXZpZ2F0ZSA9IG5ldyBFdmVudEVtaXR0ZXI8TmdiRGF0ZXBpY2tlck5hdmlnYXRlRXZlbnQ+KCk7XG5cbiAgLyoqXG4gICAqIEFuIGV2ZW50IGZpcmVkIGFmdGVyIGNsb3NpbmcgZGF0ZXBpY2tlciB3aW5kb3cuXG4gICAqXG4gICAqIEBzaW5jZSA0LjIuMFxuICAgKi9cbiAgQE91dHB1dCgpIGNsb3NlZCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICBASW5wdXQoKVxuICBnZXQgZGlzYWJsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZSA9PT0gJycgfHwgKHZhbHVlICYmIHZhbHVlICE9PSAnZmFsc2UnKTtcblxuICAgIGlmICh0aGlzLmlzT3BlbigpKSB7XG4gICAgICB0aGlzLl9jUmVmICEuaW5zdGFuY2Uuc2V0RGlzYWJsZWRTdGF0ZSh0aGlzLl9kaXNhYmxlZCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfb25DaGFuZ2UgPSAoXzogYW55KSA9PiB7fTtcbiAgcHJpdmF0ZSBfb25Ub3VjaGVkID0gKCkgPT4ge307XG4gIHByaXZhdGUgX3ZhbGlkYXRvckNoYW5nZSA9ICgpID0+IHt9O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9wYXJzZXJGb3JtYXR0ZXI6IE5nYkRhdGVQYXJzZXJGb3JtYXR0ZXIsIHByaXZhdGUgX2VsUmVmOiBFbGVtZW50UmVmPEhUTUxJbnB1dEVsZW1lbnQ+LFxuICAgICAgcHJpdmF0ZSBfdmNSZWY6IFZpZXdDb250YWluZXJSZWYsIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIsIHByaXZhdGUgX2NmcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsIHByaXZhdGUgX2NhbGVuZGFyOiBOZ2JDYWxlbmRhciwgcHJpdmF0ZSBfZGF0ZUFkYXB0ZXI6IE5nYkRhdGVBZGFwdGVyPGFueT4sXG4gICAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIF9kb2N1bWVudDogYW55LCBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICBjb25maWc6IE5nYklucHV0RGF0ZXBpY2tlckNvbmZpZykge1xuICAgIFsnYXV0b0Nsb3NlJywgJ2NvbnRhaW5lcicsICdwb3NpdGlvblRhcmdldCcsICdwbGFjZW1lbnQnXS5mb3JFYWNoKGlucHV0ID0+IHRoaXNbaW5wdXRdID0gY29uZmlnW2lucHV0XSk7XG4gICAgdGhpcy5fem9uZVN1YnNjcmlwdGlvbiA9IF9uZ1pvbmUub25TdGFibGUuc3Vic2NyaWJlKCgpID0+IHRoaXMuX3VwZGF0ZVBvcHVwUG9zaXRpb24oKSk7XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IGFueSkgPT4gYW55KTogdm9pZCB7IHRoaXMuX29uQ2hhbmdlID0gZm47IH1cblxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4gYW55KTogdm9pZCB7IHRoaXMuX29uVG91Y2hlZCA9IGZuOyB9XG5cbiAgcmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZShmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl92YWxpZGF0b3JDaGFuZ2UgPSBmbjsgfVxuXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQgeyB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDsgfVxuXG4gIHZhbGlkYXRlKGM6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAgICBjb25zdCB7dmFsdWV9ID0gYztcblxuICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICBjb25zdCBuZ2JEYXRlID0gdGhpcy5fZnJvbURhdGVTdHJ1Y3QodGhpcy5fZGF0ZUFkYXB0ZXIuZnJvbU1vZGVsKHZhbHVlKSk7XG5cbiAgICAgIGlmICghbmdiRGF0ZSkge1xuICAgICAgICByZXR1cm4geyduZ2JEYXRlJzoge2ludmFsaWQ6IHZhbHVlfX07XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm1pbkRhdGUgJiYgbmdiRGF0ZS5iZWZvcmUoTmdiRGF0ZS5mcm9tKHRoaXMubWluRGF0ZSkpKSB7XG4gICAgICAgIHJldHVybiB7J25nYkRhdGUnOiB7bWluRGF0ZToge21pbkRhdGU6IHRoaXMubWluRGF0ZSwgYWN0dWFsOiB2YWx1ZX19fTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMubWF4RGF0ZSAmJiBuZ2JEYXRlLmFmdGVyKE5nYkRhdGUuZnJvbSh0aGlzLm1heERhdGUpKSkge1xuICAgICAgICByZXR1cm4geyduZ2JEYXRlJzoge21heERhdGU6IHttYXhEYXRlOiB0aGlzLm1heERhdGUsIGFjdHVhbDogdmFsdWV9fX07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB3cml0ZVZhbHVlKHZhbHVlKSB7XG4gICAgdGhpcy5fbW9kZWwgPSB0aGlzLl9mcm9tRGF0ZVN0cnVjdCh0aGlzLl9kYXRlQWRhcHRlci5mcm9tTW9kZWwodmFsdWUpKTtcbiAgICB0aGlzLl93cml0ZU1vZGVsVmFsdWUodGhpcy5fbW9kZWwpO1xuICB9XG5cbiAgbWFudWFsRGF0ZUNoYW5nZSh2YWx1ZTogc3RyaW5nLCB1cGRhdGVWaWV3ID0gZmFsc2UpIHtcbiAgICBjb25zdCBpbnB1dFZhbHVlQ2hhbmdlZCA9IHZhbHVlICE9PSB0aGlzLl9pbnB1dFZhbHVlO1xuICAgIGlmIChpbnB1dFZhbHVlQ2hhbmdlZCkge1xuICAgICAgdGhpcy5faW5wdXRWYWx1ZSA9IHZhbHVlO1xuICAgICAgdGhpcy5fbW9kZWwgPSB0aGlzLl9mcm9tRGF0ZVN0cnVjdCh0aGlzLl9wYXJzZXJGb3JtYXR0ZXIucGFyc2UodmFsdWUpKTtcbiAgICB9XG4gICAgaWYgKGlucHV0VmFsdWVDaGFuZ2VkIHx8ICF1cGRhdGVWaWV3KSB7XG4gICAgICB0aGlzLl9vbkNoYW5nZSh0aGlzLl9tb2RlbCA/IHRoaXMuX2RhdGVBZGFwdGVyLnRvTW9kZWwodGhpcy5fbW9kZWwpIDogKHZhbHVlID09PSAnJyA/IG51bGwgOiB2YWx1ZSkpO1xuICAgIH1cbiAgICBpZiAodXBkYXRlVmlldyAmJiB0aGlzLl9tb2RlbCkge1xuICAgICAgdGhpcy5fd3JpdGVNb2RlbFZhbHVlKHRoaXMuX21vZGVsKTtcbiAgICB9XG4gIH1cblxuICBpc09wZW4oKSB7IHJldHVybiAhIXRoaXMuX2NSZWY7IH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIGRhdGVwaWNrZXIgcG9wdXAuXG4gICAqXG4gICAqIElmIHRoZSByZWxhdGVkIGZvcm0gY29udHJvbCBjb250YWlucyBhIHZhbGlkIGRhdGUsIHRoZSBjb3JyZXNwb25kaW5nIG1vbnRoIHdpbGwgYmUgb3BlbmVkLlxuICAgKi9cbiAgb3BlbigpIHtcbiAgICBpZiAoIXRoaXMuaXNPcGVuKCkpIHtcbiAgICAgIGNvbnN0IGNmID0gdGhpcy5fY2ZyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KE5nYkRhdGVwaWNrZXIpO1xuICAgICAgdGhpcy5fY1JlZiA9IHRoaXMuX3ZjUmVmLmNyZWF0ZUNvbXBvbmVudChjZik7XG5cbiAgICAgIHRoaXMuX2FwcGx5UG9wdXBTdHlsaW5nKHRoaXMuX2NSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCk7XG4gICAgICB0aGlzLl9hcHBseURhdGVwaWNrZXJJbnB1dHModGhpcy5fY1JlZi5pbnN0YW5jZSk7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVGb3JEYXRlcGlja2VyT3V0cHV0cyh0aGlzLl9jUmVmLmluc3RhbmNlKTtcbiAgICAgIHRoaXMuX2NSZWYuaW5zdGFuY2UubmdPbkluaXQoKTtcbiAgICAgIHRoaXMuX2NSZWYuaW5zdGFuY2Uud3JpdGVWYWx1ZSh0aGlzLl9kYXRlQWRhcHRlci50b01vZGVsKHRoaXMuX21vZGVsKSk7XG5cbiAgICAgIC8vIGRhdGUgc2VsZWN0aW9uIGV2ZW50IGhhbmRsaW5nXG4gICAgICB0aGlzLl9jUmVmLmluc3RhbmNlLnJlZ2lzdGVyT25DaGFuZ2UoKHNlbGVjdGVkRGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLndyaXRlVmFsdWUoc2VsZWN0ZWREYXRlKTtcbiAgICAgICAgdGhpcy5fb25DaGFuZ2Uoc2VsZWN0ZWREYXRlKTtcbiAgICAgICAgdGhpcy5fb25Ub3VjaGVkKCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fY1JlZi5jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG5cbiAgICAgIHRoaXMuX2NSZWYuaW5zdGFuY2Uuc2V0RGlzYWJsZWRTdGF0ZSh0aGlzLmRpc2FibGVkKTtcblxuICAgICAgaWYgKHRoaXMuY29udGFpbmVyID09PSAnYm9keScpIHtcbiAgICAgICAgdGhpcy5fZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLmNvbnRhaW5lcikuYXBwZW5kQ2hpbGQodGhpcy5fY1JlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgLy8gZm9jdXMgaGFuZGxpbmdcbiAgICAgIHRoaXMuX2VsV2l0aEZvY3VzID0gdGhpcy5fZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICAgIG5nYkZvY3VzVHJhcCh0aGlzLl9uZ1pvbmUsIHRoaXMuX2NSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCwgdGhpcy5jbG9zZWQsIHRydWUpO1xuICAgICAgdGhpcy5fY1JlZi5pbnN0YW5jZS5mb2N1cygpO1xuXG4gICAgICBuZ2JBdXRvQ2xvc2UoXG4gICAgICAgICAgdGhpcy5fbmdab25lLCB0aGlzLl9kb2N1bWVudCwgdGhpcy5hdXRvQ2xvc2UsICgpID0+IHRoaXMuY2xvc2UoKSwgdGhpcy5jbG9zZWQsIFtdLFxuICAgICAgICAgIFt0aGlzLl9lbFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLl9jUmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnRdKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBkYXRlcGlja2VyIHBvcHVwLlxuICAgKi9cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgIHRoaXMuX3ZjUmVmLnJlbW92ZSh0aGlzLl92Y1JlZi5pbmRleE9mKHRoaXMuX2NSZWYgIS5ob3N0VmlldykpO1xuICAgICAgdGhpcy5fY1JlZiA9IG51bGw7XG4gICAgICB0aGlzLmNsb3NlZC5lbWl0KCk7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcblxuICAgICAgLy8gcmVzdG9yZSBmb2N1c1xuICAgICAgbGV0IGVsZW1lbnRUb0ZvY3VzOiBIVE1MRWxlbWVudCB8IG51bGwgPSB0aGlzLl9lbFdpdGhGb2N1cztcbiAgICAgIGlmIChpc1N0cmluZyh0aGlzLnJlc3RvcmVGb2N1cykpIHtcbiAgICAgICAgZWxlbWVudFRvRm9jdXMgPSB0aGlzLl9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMucmVzdG9yZUZvY3VzKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5yZXN0b3JlRm9jdXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBlbGVtZW50VG9Gb2N1cyA9IHRoaXMucmVzdG9yZUZvY3VzIGFzIEhUTUxFbGVtZW50O1xuICAgICAgfVxuXG4gICAgICAvLyBpbiBJRSBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGNhbiBjb250YWluIGFuIG9iamVjdCB3aXRob3V0ICdmb2N1cygpJyBzb21ldGltZXNcbiAgICAgIGlmIChlbGVtZW50VG9Gb2N1cyAmJiBlbGVtZW50VG9Gb2N1c1snZm9jdXMnXSkge1xuICAgICAgICBlbGVtZW50VG9Gb2N1cy5mb2N1cygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZG9jdW1lbnQuYm9keS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBkYXRlcGlja2VyIHBvcHVwLlxuICAgKi9cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLmlzT3BlbigpKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3BlbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgdG8gdGhlIHByb3ZpZGVkIGRhdGUuXG4gICAqXG4gICAqIFdpdGggdGhlIGRlZmF1bHQgY2FsZW5kYXIgd2UgdXNlIElTTyA4NjAxOiAnbW9udGgnIGlzIDE9SmFuIC4uLiAxMj1EZWMuXG4gICAqIElmIG5vdGhpbmcgb3IgaW52YWxpZCBkYXRlIHByb3ZpZGVkIGNhbGVuZGFyIHdpbGwgb3BlbiBjdXJyZW50IG1vbnRoLlxuICAgKlxuICAgKiBVc2UgdGhlIGBbc3RhcnREYXRlXWAgaW5wdXQgYXMgYW4gYWx0ZXJuYXRpdmUuXG4gICAqL1xuICBuYXZpZ2F0ZVRvKGRhdGU/OiB7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk/OiBudW1iZXJ9KSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKCkpIHtcbiAgICAgIHRoaXMuX2NSZWYgIS5pbnN0YW5jZS5uYXZpZ2F0ZVRvKGRhdGUpO1xuICAgIH1cbiAgfVxuXG4gIG9uQmx1cigpIHsgdGhpcy5fb25Ub3VjaGVkKCk7IH1cblxuICBvbkZvY3VzKCkgeyB0aGlzLl9lbFdpdGhGb2N1cyA9IHRoaXMuX2VsUmVmLm5hdGl2ZUVsZW1lbnQ7IH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKGNoYW5nZXNbJ21pbkRhdGUnXSB8fCBjaGFuZ2VzWydtYXhEYXRlJ10pIHtcbiAgICAgIHRoaXMuX3ZhbGlkYXRvckNoYW5nZSgpO1xuXG4gICAgICBpZiAodGhpcy5pc09wZW4oKSkge1xuICAgICAgICBpZiAoY2hhbmdlc1snbWluRGF0ZSddKSB7XG4gICAgICAgICAgdGhpcy5fY1JlZiAhLmluc3RhbmNlLm1pbkRhdGUgPSB0aGlzLm1pbkRhdGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXNbJ21heERhdGUnXSkge1xuICAgICAgICAgIHRoaXMuX2NSZWYgIS5pbnN0YW5jZS5tYXhEYXRlID0gdGhpcy5tYXhEYXRlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NSZWYgIS5pbnN0YW5jZS5uZ09uQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy5fem9uZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlEYXRlcGlja2VySW5wdXRzKGRhdGVwaWNrZXJJbnN0YW5jZTogTmdiRGF0ZXBpY2tlcik6IHZvaWQge1xuICAgIFsnZGF5VGVtcGxhdGUnLCAnZGF5VGVtcGxhdGVEYXRhJywgJ2Rpc3BsYXlNb250aHMnLCAnZmlyc3REYXlPZldlZWsnLCAnZm9vdGVyVGVtcGxhdGUnLCAnbWFya0Rpc2FibGVkJywgJ21pbkRhdGUnLFxuICAgICAnbWF4RGF0ZScsICduYXZpZ2F0aW9uJywgJ291dHNpZGVEYXlzJywgJ3Nob3dOYXZpZ2F0aW9uJywgJ3Nob3dXZWVrZGF5cycsICdzaG93V2Vla051bWJlcnMnXVxuICAgICAgICAuZm9yRWFjaCgob3B0aW9uTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXNbb3B0aW9uTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGF0ZXBpY2tlckluc3RhbmNlW29wdGlvbk5hbWVdID0gdGhpc1tvcHRpb25OYW1lXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIGRhdGVwaWNrZXJJbnN0YW5jZS5zdGFydERhdGUgPSB0aGlzLnN0YXJ0RGF0ZSB8fCB0aGlzLl9tb2RlbDtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5UG9wdXBTdHlsaW5nKG5hdGl2ZUVsZW1lbnQ6IGFueSkge1xuICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKG5hdGl2ZUVsZW1lbnQsICdkcm9wZG93bi1tZW51Jyk7XG4gICAgdGhpcy5fcmVuZGVyZXIuYWRkQ2xhc3MobmF0aXZlRWxlbWVudCwgJ3Nob3cnKTtcblxuICAgIGlmICh0aGlzLmNvbnRhaW5lciA9PT0gJ2JvZHknKSB7XG4gICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyhuYXRpdmVFbGVtZW50LCAnbmdiLWRwLWJvZHknKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zdWJzY3JpYmVGb3JEYXRlcGlja2VyT3V0cHV0cyhkYXRlcGlja2VySW5zdGFuY2U6IE5nYkRhdGVwaWNrZXIpIHtcbiAgICBkYXRlcGlja2VySW5zdGFuY2UubmF2aWdhdGUuc3Vic2NyaWJlKG5hdmlnYXRlRXZlbnQgPT4gdGhpcy5uYXZpZ2F0ZS5lbWl0KG5hdmlnYXRlRXZlbnQpKTtcbiAgICBkYXRlcGlja2VySW5zdGFuY2UuZGF0ZVNlbGVjdC5zdWJzY3JpYmUoZGF0ZSA9PiB7XG4gICAgICB0aGlzLmRhdGVTZWxlY3QuZW1pdChkYXRlKTtcbiAgICAgIGlmICh0aGlzLmF1dG9DbG9zZSA9PT0gdHJ1ZSB8fCB0aGlzLmF1dG9DbG9zZSA9PT0gJ2luc2lkZScpIHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfd3JpdGVNb2RlbFZhbHVlKG1vZGVsOiBOZ2JEYXRlIHwgbnVsbCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fcGFyc2VyRm9ybWF0dGVyLmZvcm1hdChtb2RlbCk7XG4gICAgdGhpcy5faW5wdXRWYWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldFByb3BlcnR5KHRoaXMuX2VsUmVmLm5hdGl2ZUVsZW1lbnQsICd2YWx1ZScsIHZhbHVlKTtcbiAgICBpZiAodGhpcy5pc09wZW4oKSkge1xuICAgICAgdGhpcy5fY1JlZiAhLmluc3RhbmNlLndyaXRlVmFsdWUodGhpcy5fZGF0ZUFkYXB0ZXIudG9Nb2RlbChtb2RlbCkpO1xuICAgICAgdGhpcy5fb25Ub3VjaGVkKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZnJvbURhdGVTdHJ1Y3QoZGF0ZTogTmdiRGF0ZVN0cnVjdCB8IG51bGwpOiBOZ2JEYXRlIHwgbnVsbCB7XG4gICAgY29uc3QgbmdiRGF0ZSA9IGRhdGUgPyBuZXcgTmdiRGF0ZShkYXRlLnllYXIsIGRhdGUubW9udGgsIGRhdGUuZGF5KSA6IG51bGw7XG4gICAgcmV0dXJuIHRoaXMuX2NhbGVuZGFyLmlzVmFsaWQobmdiRGF0ZSkgPyBuZ2JEYXRlIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVBvcHVwUG9zaXRpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9jUmVmKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGhvc3RFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBpZiAoaXNTdHJpbmcodGhpcy5wb3NpdGlvblRhcmdldCkpIHtcbiAgICAgIGhvc3RFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnBvc2l0aW9uVGFyZ2V0KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucG9zaXRpb25UYXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgaG9zdEVsZW1lbnQgPSB0aGlzLnBvc2l0aW9uVGFyZ2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICBob3N0RWxlbWVudCA9IHRoaXMuX2VsUmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucG9zaXRpb25UYXJnZXQgJiYgIWhvc3RFbGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ25nYkRhdGVwaWNrZXIgY291bGQgbm90IGZpbmQgZWxlbWVudCBkZWNsYXJlZCBpbiBbcG9zaXRpb25UYXJnZXRdIHRvIHBvc2l0aW9uIGFnYWluc3QuJyk7XG4gICAgfVxuXG4gICAgcG9zaXRpb25FbGVtZW50cyhob3N0RWxlbWVudCwgdGhpcy5fY1JlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50LCB0aGlzLnBsYWNlbWVudCwgdGhpcy5jb250YWluZXIgPT09ICdib2R5Jyk7XG4gIH1cbn1cbiJdfQ==