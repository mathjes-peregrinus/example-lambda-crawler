import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import chromium from '@sparticuz/chromium';
import playwright from 'playwright-core';
import { FaturaList } from './pages/FaturaList';
import { Login } from './pages/Login';

dotenv.config();

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

export const handler = async () => {
  let browser;

  try {
    browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    const loginPage = new Login(page);

    await loginPage.navigate();

    await loginPage.fillCredentials(
      process.env.CODE_EMP || '',
      process.env.USER_EMP || '',
      process.env.PASSWORD_EM || ''
    );
    await loginPage.submit();

    const companyName = await loginPage.getCompanyName();
    console.log('Empresa detectada:', companyName);

    const faturaListPage = new FaturaList(page, context);

    await faturaListPage.navigate();

    const relatorioPage = await faturaListPage.openFirstRow();

    const dateText = await faturaListPage.getFirstRowDate();
    console.log('Data detectada:', dateText);

    const pdfBuffer = await relatorioPage.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });

    const sanitizedDate = dateText.replace('/', '-');
    const fileName = `${companyName}_${sanitizedDate}.pdf`;

    const bucketName = process.env.MY_BUCKET_NAME;

    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: pdfBuffer,
    }));

    console.log(`PDF "${fileName}" enviado ao S3 com sucesso!`);

    await browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Sucesso ao gerar e enviar PDF: ${fileName}` }),
    };

  } catch (error) {
    console.error('Erro ao processar PDF (POM):', error);
    if (browser) await browser.close();

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno ao gerar PDF (POM).' }),
    };
  }
};