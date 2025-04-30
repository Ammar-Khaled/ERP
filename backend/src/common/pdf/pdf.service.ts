import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { format } from 'date-fns';

@Injectable()
export class PdfService {
  constructor() {
    // Add custom helpers
    handlebars.registerHelper('formatDate', (date: Date) => {
      return format(new Date(date), 'yyyy-MM-dd HH:mm');
    });

    handlebars.registerHelper(
      'formatCurrency',
      (amount: any, symbol: string) => {
        const num = Number(amount);
        if (isNaN(num)) return `${symbol} 0.00`;
        return `${symbol} ${num.toFixed(2)}`;
      },
    );

    handlebars.registerHelper('now', () => new Date());
  }
  private templatesDir = path.join(__dirname, 'templates');

  async generatePdf(templateName: string, data: object) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      // Load and compile template
      const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
      const htmlContent = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(htmlContent);
      const finalHtml = template(data);

      // Set content and generate PDF
      await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
      return await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      });
    } finally {
      await browser.close();
    }
  }
}
