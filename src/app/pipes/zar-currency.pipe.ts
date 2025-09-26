import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'zarCurrency',
  standalone: true
})
export class ZarCurrencyPipe implements PipeTransform {
  transform(value: number | string): string | null {
    if (value === null || value === undefined) return null;
    
    const currencyPipe = new CurrencyPipe('en-ZA');
    return currencyPipe.transform(value, 'ZAR', 'symbol', '1.2-2', 'en-ZA');
  }
}
