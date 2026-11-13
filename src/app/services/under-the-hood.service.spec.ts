import { UnderTheHoodService } from './under-the-hood.service';

describe('UnderTheHoodService', () => {
  const KEY = 'videoflix.underTheHood';

  beforeEach(() => localStorage.removeItem(KEY));
  afterEach(() => localStorage.removeItem(KEY));

  it('is off by default', () => {
    expect(new UnderTheHoodService().enabled()).toBe(false);
  });

  it('remembers the value after a new instance', () => {
    new UnderTheHoodService().toggle();
    expect(new UnderTheHoodService().enabled()).toBe(true);
  });

  it('switches back off', () => {
    const service = new UnderTheHoodService();
    service.toggle();
    service.toggle();
    expect(service.enabled()).toBe(false);
    expect(new UnderTheHoodService().enabled()).toBe(false);
  });

  // A throwing storage cannot be produced otherwise (private mode, blocked site data).
  it('works when reading storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const service = new UnderTheHoodService();
    expect(service.enabled()).toBe(false);
    service.toggle();
    expect(service.enabled()).toBe(true);
  });

  it('works when writing storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const service = new UnderTheHoodService();
    service.toggle();
    expect(service.enabled()).toBe(true);
  });
});
