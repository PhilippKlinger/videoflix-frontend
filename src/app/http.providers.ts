import { EnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, withXhr, withXsrfConfiguration } from '@angular/common/http';

// Django sets the csrftoken cookie on login; cookie requests must send it back as X-CSRFToken.
// Angular only adds the header to relative URLs, so the API base stays '/api'.
export function provideAppHttpClient(): EnvironmentProviders {
  return provideHttpClient(
    withXhr(),
    withInterceptorsFromDi(),
    withXsrfConfiguration({ cookieName: 'csrftoken', headerName: 'X-CSRFToken' })
  );
}
