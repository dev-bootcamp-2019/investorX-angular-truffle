import { AppPage } from './app.po';

describe('investorX-angular-truffle App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getHeader()).toContain('Angular Truffle Box');
  });
});
