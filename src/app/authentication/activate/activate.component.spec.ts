import type { Mock } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { ActivateComponent } from './activate.component';
import { ApiService } from 'src/app/services/api.service';

describe('ActivateComponent', () => {
  let fixture: ComponentFixture<ActivateComponent>;
  let activateSpy: Mock;
  let newLinkSpy: Mock;

  function create(response: Observable<unknown>): ActivateComponent {
    activateSpy.mockReturnValue(response);
    fixture = TestBed.createComponent(ActivateComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    activateSpy = vi.fn().mockName('activateAccount');
    newLinkSpy = vi.fn().mockName('getNewActivationEmail');
    TestBed.configureTestingModule({
      imports: [ActivateComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: { activateAccount: activateSpy, getNewActivationEmail: newLinkSpy } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ uid: 'MQ', token: 'abc' })) } },
      ]
    });
  });

  it('shows success after activation', () => {
    const component = create(of({ detail: 'Account successfully activated.' }));
    expect(activateSpy).toHaveBeenCalledWith('MQ', 'abc');
    expect(component.activated).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Your account is active.');
  });

  it('shows an error for an invalid link', () => {
    const component = create(throwError(() => new HttpErrorResponse({ status: 400 })));
    expect(component.failed).toBe(true);
    const link: HTMLAnchorElement | null = fixture.nativeElement.querySelector('a[href="/login"]');
    expect(link).not.toBeNull();
  });

  describe('request a new link', () => {
    function submit(email: string): void {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="email"]');
      input.value = email;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
      fixture.detectChanges();
    }

    beforeEach(() => create(throwError(() => new HttpErrorResponse({ status: 400 }))));

    it('sends the address and shows a neutral confirmation', () => {
      newLinkSpy.mockReturnValue(of({ detail: 'ok' }));
      submit('max@example.com');
      expect(newLinkSpy).toHaveBeenCalledWith({ email: 'max@example.com' });
      expect(fixture.nativeElement.textContent).toContain('If this address needs activation');
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('does not call the API for an invalid address', () => {
      submit('not-an-email');
      expect(newLinkSpy).not.toHaveBeenCalled();
    });

    it('shows a friendly error without technical text when the request fails', () => {
      newLinkSpy.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })));
      submit('max@example.com');
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('Could not send a new link. Please try again in a moment.');
      expect(text).not.toContain('500');
      expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    });
  });
});
