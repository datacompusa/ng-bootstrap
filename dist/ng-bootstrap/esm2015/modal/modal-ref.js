import { of, Subject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
/**
 * A reference to the currently opened (active) modal.
 *
 * Instances of this class can be injected into your component passed as modal content.
 * So you can `.close()` or `.dismiss()` the modal window from your component.
 */
export class NgbActiveModal {
    /**
     * Closes the modal with an optional `result` value.
     *
     * The `NgbModalRef.result` promise will be resolved with the provided value.
     */
    close(result) { }
    /**
     * Dismisses the modal with an optional `reason` value.
     *
     * The `NgbModalRef.result` promise will be rejected with the provided value.
     */
    dismiss(reason) { }
}
/**
 * A reference to the newly opened modal returned by the `NgbModal.open()` method.
 */
export class NgbModalRef {
    constructor(_windowCmptRef, _contentRef, _backdropCmptRef, _beforeDismiss) {
        this._windowCmptRef = _windowCmptRef;
        this._contentRef = _contentRef;
        this._backdropCmptRef = _backdropCmptRef;
        this._beforeDismiss = _beforeDismiss;
        this._closed = new Subject();
        this._dismissed = new Subject();
        this._hidden = new Subject();
        _windowCmptRef.instance.dismissEvent.subscribe((reason) => { this.dismiss(reason); });
        this.result = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        this.result.then(null, () => { });
    }
    /**
     * The instance of a component used for the modal content.
     *
     * When a `TemplateRef` is used as the content or when the modal is closed, will return `undefined`.
     */
    get componentInstance() {
        if (this._contentRef && this._contentRef.componentRef) {
            return this._contentRef.componentRef.instance;
        }
    }
    /**
     * The observable that emits when the modal is closed via the `.close()` method.
     *
     * It will emit the result passed to the `.close()` method.
     *
     * @since 8.0.0
     */
    get closed() { return this._closed.asObservable().pipe(takeUntil(this._hidden)); }
    /**
     * The observable that emits when the modal is dismissed via the `.dismiss()` method.
     *
     * It will emit the reason passed to the `.dismissed()` method by the user, or one of the internal
     * reasons like backdrop click or ESC key press.
     *
     * @since 8.0.0
     */
    get dismissed() { return this._dismissed.asObservable().pipe(takeUntil(this._hidden)); }
    /**
     * The observable that emits when both modal window and backdrop are closed and animations were finished.
     * At this point modal and backdrop elements will be removed from the DOM tree.
     *
     * This observable will be completed after emitting.
     *
     * @since 8.0.0
     */
    get hidden() { return this._hidden.asObservable(); }
    /**
     * The observable that emits when modal is fully visible and animation was finished.
     * Modal DOM element is always available synchronously after calling 'modal.open()' service.
     *
     * This observable will be completed after emitting.
     * It will not emit, if modal is closed before open animation is finished.
     *
     * @since 8.0.0
     */
    get shown() { return this._windowCmptRef.instance.shown.asObservable(); }
    /**
     * Closes the modal with an optional `result` value.
     *
     * The `NgbMobalRef.result` promise will be resolved with the provided value.
     */
    close(result) {
        if (this._windowCmptRef) {
            this._closed.next(result);
            this._resolve(result);
            this._removeModalElements();
        }
    }
    _dismiss(reason) {
        this._dismissed.next(reason);
        this._reject(reason);
        this._removeModalElements();
    }
    /**
     * Dismisses the modal with an optional `reason` value.
     *
     * The `NgbModalRef.result` promise will be rejected with the provided value.
     */
    dismiss(reason) {
        if (this._windowCmptRef) {
            if (!this._beforeDismiss) {
                this._dismiss(reason);
            }
            else {
                const dismiss = this._beforeDismiss();
                if (dismiss && dismiss.then) {
                    dismiss.then(result => {
                        if (result !== false) {
                            this._dismiss(reason);
                        }
                    }, () => { });
                }
                else if (dismiss !== false) {
                    this._dismiss(reason);
                }
            }
        }
    }
    _removeModalElements() {
        const windowTransition$ = this._windowCmptRef.instance.hide();
        const backdropTransition$ = this._backdropCmptRef ? this._backdropCmptRef.instance.hide() : of(undefined);
        // hiding window
        windowTransition$.subscribe(() => {
            const { nativeElement } = this._windowCmptRef.location;
            nativeElement.parentNode.removeChild(nativeElement);
            this._windowCmptRef.destroy();
            if (this._contentRef && this._contentRef.viewRef) {
                this._contentRef.viewRef.destroy();
            }
            this._windowCmptRef = null;
            this._contentRef = null;
        });
        // hiding backdrop
        backdropTransition$.subscribe(() => {
            if (this._backdropCmptRef) {
                const { nativeElement } = this._backdropCmptRef.location;
                nativeElement.parentNode.removeChild(nativeElement);
                this._backdropCmptRef.destroy();
                this._backdropCmptRef = null;
            }
        });
        // all done
        zip(windowTransition$, backdropTransition$).subscribe(() => {
            this._hidden.next();
            this._hidden.complete();
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kYWwtcmVmLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9nYWJyaWVsL0RldmVsb3BtZW50L25nLWJvb3RzdHJhcC9zcmMvIiwic291cmNlcyI6WyJtb2RhbC9tb2RhbC1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFhLEVBQUUsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQU96Qzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxjQUFjO0lBQ3pCOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsTUFBWSxJQUFTLENBQUM7SUFFNUI7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxNQUFZLElBQVMsQ0FBQztDQUMvQjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFdBQVc7SUErRHRCLFlBQ1ksY0FBNEMsRUFBVSxXQUF1QixFQUM3RSxnQkFBaUQsRUFBVSxjQUF5QjtRQURwRixtQkFBYyxHQUFkLGNBQWMsQ0FBOEI7UUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUM3RSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlDO1FBQVUsbUJBQWMsR0FBZCxjQUFjLENBQVc7UUFoRXhGLFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBTyxDQUFDO1FBQzdCLGVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBTyxDQUFDO1FBQ2hDLFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBK0RwQyxjQUFjLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUzRixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzVDLElBQUksQ0FB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QUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudFJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7T2JzZXJ2YWJsZSwgb2YsIFN1YmplY3QsIHppcH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge05nYk1vZGFsQmFja2Ryb3B9IGZyb20gJy4vbW9kYWwtYmFja2Ryb3AnO1xuaW1wb3J0IHtOZ2JNb2RhbFdpbmRvd30gZnJvbSAnLi9tb2RhbC13aW5kb3cnO1xuXG5pbXBvcnQge0NvbnRlbnRSZWZ9IGZyb20gJy4uL3V0aWwvcG9wdXAnO1xuXG4vKipcbiAqIEEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50bHkgb3BlbmVkIChhY3RpdmUpIG1vZGFsLlxuICpcbiAqIEluc3RhbmNlcyBvZiB0aGlzIGNsYXNzIGNhbiBiZSBpbmplY3RlZCBpbnRvIHlvdXIgY29tcG9uZW50IHBhc3NlZCBhcyBtb2RhbCBjb250ZW50LlxuICogU28geW91IGNhbiBgLmNsb3NlKClgIG9yIGAuZGlzbWlzcygpYCB0aGUgbW9kYWwgd2luZG93IGZyb20geW91ciBjb21wb25lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ2JBY3RpdmVNb2RhbCB7XG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIG1vZGFsIHdpdGggYW4gb3B0aW9uYWwgYHJlc3VsdGAgdmFsdWUuXG4gICAqXG4gICAqIFRoZSBgTmdiTW9kYWxSZWYucmVzdWx0YCBwcm9taXNlIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCB0aGUgcHJvdmlkZWQgdmFsdWUuXG4gICAqL1xuICBjbG9zZShyZXN1bHQ/OiBhbnkpOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIERpc21pc3NlcyB0aGUgbW9kYWwgd2l0aCBhbiBvcHRpb25hbCBgcmVhc29uYCB2YWx1ZS5cbiAgICpcbiAgICogVGhlIGBOZ2JNb2RhbFJlZi5yZXN1bHRgIHByb21pc2Ugd2lsbCBiZSByZWplY3RlZCB3aXRoIHRoZSBwcm92aWRlZCB2YWx1ZS5cbiAgICovXG4gIGRpc21pc3MocmVhc29uPzogYW55KTogdm9pZCB7fVxufVxuXG4vKipcbiAqIEEgcmVmZXJlbmNlIHRvIHRoZSBuZXdseSBvcGVuZWQgbW9kYWwgcmV0dXJuZWQgYnkgdGhlIGBOZ2JNb2RhbC5vcGVuKClgIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE5nYk1vZGFsUmVmIHtcbiAgcHJpdmF0ZSBfY2xvc2VkID0gbmV3IFN1YmplY3Q8YW55PigpO1xuICBwcml2YXRlIF9kaXNtaXNzZWQgPSBuZXcgU3ViamVjdDxhbnk+KCk7XG4gIHByaXZhdGUgX2hpZGRlbiA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHByaXZhdGUgX3Jlc29sdmU6IChyZXN1bHQ/OiBhbnkpID0+IHZvaWQ7XG4gIHByaXZhdGUgX3JlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZDtcblxuICAvKipcbiAgICogVGhlIGluc3RhbmNlIG9mIGEgY29tcG9uZW50IHVzZWQgZm9yIHRoZSBtb2RhbCBjb250ZW50LlxuICAgKlxuICAgKiBXaGVuIGEgYFRlbXBsYXRlUmVmYCBpcyB1c2VkIGFzIHRoZSBjb250ZW50IG9yIHdoZW4gdGhlIG1vZGFsIGlzIGNsb3NlZCwgd2lsbCByZXR1cm4gYHVuZGVmaW5lZGAuXG4gICAqL1xuICBnZXQgY29tcG9uZW50SW5zdGFuY2UoKTogYW55IHtcbiAgICBpZiAodGhpcy5fY29udGVudFJlZiAmJiB0aGlzLl9jb250ZW50UmVmLmNvbXBvbmVudFJlZikge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbnRlbnRSZWYuY29tcG9uZW50UmVmLmluc3RhbmNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIG1vZGFsIGlzIGNsb3NlZCBhbmQgcmVqZWN0ZWQgd2hlbiB0aGUgbW9kYWwgaXMgZGlzbWlzc2VkLlxuICAgKi9cbiAgcmVzdWx0OiBQcm9taXNlPGFueT47XG5cbiAgLyoqXG4gICAqIFRoZSBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiB0aGUgbW9kYWwgaXMgY2xvc2VkIHZpYSB0aGUgYC5jbG9zZSgpYCBtZXRob2QuXG4gICAqXG4gICAqIEl0IHdpbGwgZW1pdCB0aGUgcmVzdWx0IHBhc3NlZCB0byB0aGUgYC5jbG9zZSgpYCBtZXRob2QuXG4gICAqXG4gICAqIEBzaW5jZSA4LjAuMFxuICAgKi9cbiAgZ2V0IGNsb3NlZCgpOiBPYnNlcnZhYmxlPGFueT4geyByZXR1cm4gdGhpcy5fY2xvc2VkLmFzT2JzZXJ2YWJsZSgpLnBpcGUodGFrZVVudGlsKHRoaXMuX2hpZGRlbikpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiB0aGUgbW9kYWwgaXMgZGlzbWlzc2VkIHZpYSB0aGUgYC5kaXNtaXNzKClgIG1ldGhvZC5cbiAgICpcbiAgICogSXQgd2lsbCBlbWl0IHRoZSByZWFzb24gcGFzc2VkIHRvIHRoZSBgLmRpc21pc3NlZCgpYCBtZXRob2QgYnkgdGhlIHVzZXIsIG9yIG9uZSBvZiB0aGUgaW50ZXJuYWxcbiAgICogcmVhc29ucyBsaWtlIGJhY2tkcm9wIGNsaWNrIG9yIEVTQyBrZXkgcHJlc3MuXG4gICAqXG4gICAqIEBzaW5jZSA4LjAuMFxuICAgKi9cbiAgZ2V0IGRpc21pc3NlZCgpOiBPYnNlcnZhYmxlPGFueT4geyByZXR1cm4gdGhpcy5fZGlzbWlzc2VkLmFzT2JzZXJ2YWJsZSgpLnBpcGUodGFrZVVudGlsKHRoaXMuX2hpZGRlbikpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiBib3RoIG1vZGFsIHdpbmRvdyBhbmQgYmFja2Ryb3AgYXJlIGNsb3NlZCBhbmQgYW5pbWF0aW9ucyB3ZXJlIGZpbmlzaGVkLlxuICAgKiBBdCB0aGlzIHBvaW50IG1vZGFsIGFuZCBiYWNrZHJvcCBlbGVtZW50cyB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgRE9NIHRyZWUuXG4gICAqXG4gICAqIFRoaXMgb2JzZXJ2YWJsZSB3aWxsIGJlIGNvbXBsZXRlZCBhZnRlciBlbWl0dGluZy5cbiAgICpcbiAgICogQHNpbmNlIDguMC4wXG4gICAqL1xuICBnZXQgaGlkZGVuKCk6IE9ic2VydmFibGU8dm9pZD4geyByZXR1cm4gdGhpcy5faGlkZGVuLmFzT2JzZXJ2YWJsZSgpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiBtb2RhbCBpcyBmdWxseSB2aXNpYmxlIGFuZCBhbmltYXRpb24gd2FzIGZpbmlzaGVkLlxuICAgKiBNb2RhbCBET00gZWxlbWVudCBpcyBhbHdheXMgYXZhaWxhYmxlIHN5bmNocm9ub3VzbHkgYWZ0ZXIgY2FsbGluZyAnbW9kYWwub3BlbigpJyBzZXJ2aWNlLlxuICAgKlxuICAgKiBUaGlzIG9ic2VydmFibGUgd2lsbCBiZSBjb21wbGV0ZWQgYWZ0ZXIgZW1pdHRpbmcuXG4gICAqIEl0IHdpbGwgbm90IGVtaXQsIGlmIG1vZGFsIGlzIGNsb3NlZCBiZWZvcmUgb3BlbiBhbmltYXRpb24gaXMgZmluaXNoZWQuXG4gICAqXG4gICAqIEBzaW5jZSA4LjAuMFxuICAgKi9cbiAgZ2V0IHNob3duKCk6IE9ic2VydmFibGU8dm9pZD4geyByZXR1cm4gdGhpcy5fd2luZG93Q21wdFJlZi5pbnN0YW5jZS5zaG93bi5hc09ic2VydmFibGUoKTsgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfd2luZG93Q21wdFJlZjogQ29tcG9uZW50UmVmPE5nYk1vZGFsV2luZG93PiwgcHJpdmF0ZSBfY29udGVudFJlZjogQ29udGVudFJlZixcbiAgICAgIHByaXZhdGUgX2JhY2tkcm9wQ21wdFJlZj86IENvbXBvbmVudFJlZjxOZ2JNb2RhbEJhY2tkcm9wPiwgcHJpdmF0ZSBfYmVmb3JlRGlzbWlzcz86IEZ1bmN0aW9uKSB7XG4gICAgX3dpbmRvd0NtcHRSZWYuaW5zdGFuY2UuZGlzbWlzc0V2ZW50LnN1YnNjcmliZSgocmVhc29uOiBhbnkpID0+IHsgdGhpcy5kaXNtaXNzKHJlYXNvbik7IH0pO1xuXG4gICAgdGhpcy5yZXN1bHQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHRoaXMuX3JlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcbiAgICB0aGlzLnJlc3VsdC50aGVuKG51bGwsICgpID0+IHt9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIG1vZGFsIHdpdGggYW4gb3B0aW9uYWwgYHJlc3VsdGAgdmFsdWUuXG4gICAqXG4gICAqIFRoZSBgTmdiTW9iYWxSZWYucmVzdWx0YCBwcm9taXNlIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCB0aGUgcHJvdmlkZWQgdmFsdWUuXG4gICAqL1xuICBjbG9zZShyZXN1bHQ/OiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fd2luZG93Q21wdFJlZikge1xuICAgICAgdGhpcy5fY2xvc2VkLm5leHQocmVzdWx0KTtcbiAgICAgIHRoaXMuX3Jlc29sdmUocmVzdWx0KTtcbiAgICAgIHRoaXMuX3JlbW92ZU1vZGFsRWxlbWVudHMoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9kaXNtaXNzKHJlYXNvbj86IGFueSkge1xuICAgIHRoaXMuX2Rpc21pc3NlZC5uZXh0KHJlYXNvbik7XG4gICAgdGhpcy5fcmVqZWN0KHJlYXNvbik7XG4gICAgdGhpcy5fcmVtb3ZlTW9kYWxFbGVtZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc21pc3NlcyB0aGUgbW9kYWwgd2l0aCBhbiBvcHRpb25hbCBgcmVhc29uYCB2YWx1ZS5cbiAgICpcbiAgICogVGhlIGBOZ2JNb2RhbFJlZi5yZXN1bHRgIHByb21pc2Ugd2lsbCBiZSByZWplY3RlZCB3aXRoIHRoZSBwcm92aWRlZCB2YWx1ZS5cbiAgICovXG4gIGRpc21pc3MocmVhc29uPzogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3dpbmRvd0NtcHRSZWYpIHtcbiAgICAgIGlmICghdGhpcy5fYmVmb3JlRGlzbWlzcykge1xuICAgICAgICB0aGlzLl9kaXNtaXNzKHJlYXNvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkaXNtaXNzID0gdGhpcy5fYmVmb3JlRGlzbWlzcygpO1xuICAgICAgICBpZiAoZGlzbWlzcyAmJiBkaXNtaXNzLnRoZW4pIHtcbiAgICAgICAgICBkaXNtaXNzLnRoZW4oXG4gICAgICAgICAgICAgIHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc21pc3MocmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICgpID0+IHt9KTtcbiAgICAgICAgfSBlbHNlIGlmIChkaXNtaXNzICE9PSBmYWxzZSkge1xuICAgICAgICAgIHRoaXMuX2Rpc21pc3MocmVhc29uKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlbW92ZU1vZGFsRWxlbWVudHMoKSB7XG4gICAgY29uc3Qgd2luZG93VHJhbnNpdGlvbiQgPSB0aGlzLl93aW5kb3dDbXB0UmVmLmluc3RhbmNlLmhpZGUoKTtcbiAgICBjb25zdCBiYWNrZHJvcFRyYW5zaXRpb24kID0gdGhpcy5fYmFja2Ryb3BDbXB0UmVmID8gdGhpcy5fYmFja2Ryb3BDbXB0UmVmLmluc3RhbmNlLmhpZGUoKSA6IG9mKHVuZGVmaW5lZCk7XG5cbiAgICAvLyBoaWRpbmcgd2luZG93XG4gICAgd2luZG93VHJhbnNpdGlvbiQuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGNvbnN0IHtuYXRpdmVFbGVtZW50fSA9IHRoaXMuX3dpbmRvd0NtcHRSZWYubG9jYXRpb247XG4gICAgICBuYXRpdmVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobmF0aXZlRWxlbWVudCk7XG4gICAgICB0aGlzLl93aW5kb3dDbXB0UmVmLmRlc3Ryb3koKTtcblxuICAgICAgaWYgKHRoaXMuX2NvbnRlbnRSZWYgJiYgdGhpcy5fY29udGVudFJlZi52aWV3UmVmKSB7XG4gICAgICAgIHRoaXMuX2NvbnRlbnRSZWYudmlld1JlZi5kZXN0cm95KCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3dpbmRvd0NtcHRSZWYgPSA8YW55Pm51bGw7XG4gICAgICB0aGlzLl9jb250ZW50UmVmID0gPGFueT5udWxsO1xuICAgIH0pO1xuXG4gICAgLy8gaGlkaW5nIGJhY2tkcm9wXG4gICAgYmFja2Ryb3BUcmFuc2l0aW9uJC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2JhY2tkcm9wQ21wdFJlZikge1xuICAgICAgICBjb25zdCB7bmF0aXZlRWxlbWVudH0gPSB0aGlzLl9iYWNrZHJvcENtcHRSZWYubG9jYXRpb247XG4gICAgICAgIG5hdGl2ZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuYXRpdmVFbGVtZW50KTtcbiAgICAgICAgdGhpcy5fYmFja2Ryb3BDbXB0UmVmLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5fYmFja2Ryb3BDbXB0UmVmID0gPGFueT5udWxsO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gYWxsIGRvbmVcbiAgICB6aXAod2luZG93VHJhbnNpdGlvbiQsIGJhY2tkcm9wVHJhbnNpdGlvbiQpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9oaWRkZW4ubmV4dCgpO1xuICAgICAgdGhpcy5faGlkZGVuLmNvbXBsZXRlKCk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==