import { UnderTheHoodService } from './under-the-hood.service';

describe('UnderTheHoodService', () => {
  const KEY = 'videoflix.underTheHood';

  beforeEach(() => localStorage.removeItem(KEY));
  afterEach(() => localStorage.removeItem(KEY));

  it('is off by default', () => {
    expect(new UnderTheHoodService().enabled()).toBeFalse();
  });

  it('remembers the value after a new instance', () => {
    new UnderTheHoodService().toggle();
    expect(new UnderTheHoodService().enabled()).toBeTrue();
  });

  it('switches back off', () => {
    const service = new UnderTheHoodService();
    service.toggle();
    service.toggle();
    expect(service.enabled()).toBeFalse();
    expect(new UnderTheHoodService().enabled()).toBeFalse();
  });

  // A throwing storage cannot be produced otherwise (private mode, blocked site data).
  it('works when reading storage throws', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('blocked');
    const service = new UnderTheHoodService();
    expect(service.enabled()).toBeFalse();
    service.toggle();
    expect(service.enabled()).toBeTrue();
  });

  it('works when writing storage throws', () => {
    spyOn(Storage.prototype, 'setItem').and.throwError('blocked');
    const service = new UnderTheHoodService();
    service.toggle();
    expect(service.enabled()).toBeTrue();
  });
});
