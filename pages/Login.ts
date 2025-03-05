import { Page } from 'playwright-core';

export class Login {
    private page: Page;
  
    constructor(page: Page) {
      this.page = page;
    }
  
    public async navigate() {
      await this.page.goto('https://saude.sulamericaseguros.com.br/empresa/login/');
    }
  
    public async fillCredentials(codeEmp: string, userEmp: string, passwordEmp: string) {
      await this.page.locator('#code').fill(codeEmp);
      await this.page.locator('#user').fill(userEmp);
      await this.page.locator('#senha').fill(passwordEmp);
    }
  
    public async submit() {
      await this.page.getByRole('link', { name: 'ENTRAR' }).click();
    }
  
    public async getCompanyName() {
      const rawText = await this.page.locator('td[style="width:55%;"]').innerText();
      return rawText.replace('Empresa:', '').trim();
    }
  }