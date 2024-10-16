import { Injectable } from '@nestjs/common';
import { sheets_v4 } from 'googleapis';
import { SheetHeader } from 'src/utils/constants/sheet-header.constant';

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
}
