import { Injectable } from '@nestjs/common';
import { sheets_v4 } from 'googleapis';
import { SheetHeader } from 'src/utils/constants/sheet-header.constant';
import { CreateProductDto, UpdateProductDto } from 'store-mag-types';

@Injectable()
export class SheetConvertorService {
  getHeaders(data: sheets_v4.Schema$ValueRange): string[] {
    const [headers] = data.values;

    return headers;
  }

  convertSheetData(data: sheets_v4.Schema$ValueRange): Record<string, any>[] {
    const headers = this.getHeaders(data);

    const [, ...rows] = data.values;

    const result = rows.map((row, rowIndex) => {
      return headers.reduce((acc, header, index) => {
        const propName = SheetHeader.get(header);
        return {
          index: rowIndex + 2,
          ...acc,
          [propName]: row[index] || null,
        };
      }, {});
    });

    return result;
  }

  convertSheetRowData(data: sheets_v4.Schema$ValueRange): Record<string, any> {
    const headers = ['', ...SheetHeader.values()];

    const [row] = data.values;

    return headers.reduce((acc, header, index) => {
      return {
        ...acc,
        [header]: row[index] || null,
      };
    }, {});
  }

  convertDataToRow(
    data: Omit<UpdateProductDto, 'index'> | CreateProductDto,
  ): Array<string | number | boolean> {
    const sale_date = 'sale_date' in data ? data.sale_date : '';
    const calculation = 'calculation' in data ? data.calculation : '';

    return [
      '',
      data.model,
      data.imei,
      data.supplier,
      sale_date,
      data.storeId,
      data.purchase_price,
      data.sale_price || '',
      data.salary || '',
      data.expense,
      calculation,
      data.result,
    ];
  }

  getCreatedRowIndex(data: sheets_v4.Schema$AppendValuesResponse): number {
    const { updates } = data;

    const { updatedRange } = updates;

    const [, segment] = updatedRange.split('!A');

    const [index] = segment.split(':');

    return Number(index);
  }
}
