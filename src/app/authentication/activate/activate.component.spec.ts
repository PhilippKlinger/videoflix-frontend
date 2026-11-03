import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { ActivateComponent } from './activate.component';
import { ApiService } from 'src/app/services/api.service';

describe('ActivateComponent', () => {
  let fixture: ComponentFixture<ActivateComponent>;
  let activateSpy: jasmine.Spy;

  function create(response: Observable<unknown>): ActivateComponent {
    activateSpy.and.returnValue(response);
    fixture = TestBed.createComponent(ActivateComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    activateSpy = jasmine.createSpy('activateAccount');
    TestBed.configureTestingModule({
      imports: [ActivateComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: { activateAccount: activateSpy } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ uid: 'MQ', token: 'abc' })) } },
      ]
    });
  });

  it('shows success after activation', () => {
    const component = create(of({ detail: 'Account successfully activated.' }));
    expect(activateSpy).toHaveBeenCalledWith('MQ', 'abc');
    expect(component.activated).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Your account is active.');
  });

  it('shows an error for an invalid link', () => {
    const component = create(throwError(() => new HttpErrorResponse({ status: 400 })));
    expect(component.failed).toBeTrue();
    const link: HTMLAnchorElement | null = fixture.nativeElement.querySelector('a[href="/login"]');
    expect(link).not.toBeNull();
  });
});
