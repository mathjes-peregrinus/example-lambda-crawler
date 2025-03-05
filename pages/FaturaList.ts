import { Page, BrowserContext } from 'playwright-core';

export class FaturaList {
    private page: Page;
    private context: BrowserContext;
    private tableSelector = '#faturaUnificadaTable tbody tr';
  
    constructor(page: Page, context: BrowserContext) {
      this.page = page;
      this.context = context;
    }
  
    public async navigate() {
      await this.page.goto('https://saude.sulamericaseguros.com.br/empresa/faturamento/emissao-de-fatura-de-premio/fatura-unica/');
    }
  
    public async openFirstRow(): Promise<Page> {
      const [relatorioPage] = await Promise.all([
        this.context.waitForEvent('page'),
        this.page.locator(this.tableSelector).first().locator('td').first().locator('a').click()
      ]);
      await relatorioPage.waitForLoadState('networkidle');
      await relatorioPage.waitForSelector('#loadingTable', { state: 'hidden' });
      return relatorioPage;
    }
    
    public async getFirstRowDate(): Promise<string> {
      return this.page
        .locator(this.tableSelector)
        .first()
        .locator('td')
        .first()
        .locator('a')
        .innerText();
    }
  }