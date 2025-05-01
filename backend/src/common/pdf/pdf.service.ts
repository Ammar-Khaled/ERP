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
    handlebars.registerHelper('formatDate', (date: Date | string | null | undefined) => {
      if (!date) return 'N/A'; // Handle null/undefined
      
      const dateObj = date instanceof Date ? date : new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return format(dateObj, 'yyyy-MM-dd HH:mm');
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
    const browser = await puppeteer.launch(); // default 'headless' is true
    const page = await browser.newPage();

    try {
      // Load and compile template
      const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
      const htmlContent = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(htmlContent);
      const finalHtml = template({
        ...data,
        now: new Date() // for footer
      });

      // Set content and generate PDF
      await page.setContent(finalHtml, {
        waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
        timeout: 30000
      });

      await page.waitForSelector('body'); // wait for DOM 
      await page.emulateMediaType('print');

      const retPdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        scale: 0.8, // just a trial
      });
      return retPdf;
    } catch(err) {
      console.log(err);
    } finally {
      await browser.close();
    }
  }
}
