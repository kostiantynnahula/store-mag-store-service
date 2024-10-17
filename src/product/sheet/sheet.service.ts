import { Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { GoogleAuth, Compute } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { SheetConvertorService } from 'src/utils/services/sheet-convert.service';
import { LocalCache } from 'src/utils/services/local-cache.service';
import { CreateProductDto, UpdateProductDto } from 'store-mag-types';
import { ColorService } from 'src/utils/services/color.service';

@Injectable()
export class SheetService {
  private auth: GoogleAuth;
  private readonly sheetId: string;
  private readonly sheetName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly sheetConvertorService: SheetConvertorService,
    private readonly localCache: LocalCache<Compute>,
  ) {
    const keyFile = path.join(
      __dirname,
      configService.get<string>('GOOGLE_SHEET_KEY_FILE'),
    );

    this.auth = new google.auth.GoogleAuth({
      keyFile: keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheetId = configService.get<string>('GOOGLE_SHEET_ID');
    this.sheetName = 'Sheet1';
  }

  async getClient(): Promise<Compute> {
    const cachedClient = await this.localCache.get('google_client');

    if (cachedClient) {
      return cachedClient;
    }

    const client = (await this.auth.getClient()) as Compute;

    await this.localCache.set('google_client', client, 3000);

    return client;
  }

  async getSheets(): Promise<sheets_v4.Sheets> {
    const client = await this.getClient();

    return google.sheets({ version: 'v4', auth: client });
  }

  async getMetaData(): Promise<sheets_v4.Schema$Spreadsheet> {
    const sheets = await this.getSheets();

    const response = await sheets.spreadsheets.get({
      auth: this.auth,
      spreadsheetId: this.sheetId,
    });

    return response.data;
  }

  async getSheetId(): Promise<number> {
    const sheetMetaData = await this.getMetaData();
    const sheetIdNumber = sheetMetaData.sheets.find(
      (sheet) => sheet.properties.title === this.sheetName,
    ).properties.sheetId;

    return sheetIdNumber;
  }

  async getSheetData(): Promise<Record<string, any>> {
    const client = await this.getClient();

    const sheets = google.sheets({ version: 'v4', auth: client });

    const result = await sheets.spreadsheets.values.get({
      auth: this.auth,
      spreadsheetId: this.sheetId,
      range: 'Sheet1',
    });

    return this.sheetConvertorService.convertSheetData(result.data);
  }

  async getSheetRowData(index: string) {
    const client = await this.getClient();

    const sheets = google.sheets({ version: 'v4', auth: client });

    const result = await sheets.spreadsheets.values.get({
      auth: this.auth,
      spreadsheetId: this.sheetId,
      range: `Sheet1!A${index}:N${index}`,
    });

    const rowData = this.sheetConvertorService.convertSheetRowData(result.data);

    return { index, ...rowData };
  }

  async addRow(
    data: CreateProductDto,
  ): Promise<sheets_v4.Schema$AppendValuesResponse> {
    const sheets = await this.getSheets();

    const values = this.sheetConvertorService.convertDataToRow(data);

    const response = await sheets.spreadsheets.values.append({
      auth: this.auth,
      spreadsheetId: this.sheetId,
      range: 'Sheet1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });

    const rowIndex = this.sheetConvertorService.getCreatedRowIndex(
      response.data,
    );

    const rowColors = ColorService.rowColors(1, 15);

    rowColors.forEach((color) => {
      this.formatRow(rowIndex, color.from, color.to, color.color);
    });

    return response.data;
  }

  async editRow({
    index,
    ...data
  }: UpdateProductDto): Promise<sheets_v4.Schema$UpdateValuesResponse> {
    const sheets = await this.getSheets();

    const values = this.sheetConvertorService.convertDataToRow(data);

    const response = await sheets.spreadsheets.values.update({
      auth: this.auth,
      spreadsheetId: this.sheetId,
      range: `Sheet1!${index}:${index}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });

    return response.data;
  }

  async deleteRow(
    index: number,
  ): Promise<sheets_v4.Schema$BatchUpdateSpreadsheetResponse> {
    const sheets = await this.getSheets();

    const sheetIdNumber = await this.getSheetId();

    const requests = [
      {
        deleteDimension: {
          range: {
            sheetId: sheetIdNumber,
            dimension: 'ROWS', // We are deleting a row
            startIndex: index - 1, // Row indices are zero-based, so subtract 1
            endIndex: index, // Deletes one row, from startIndex to endIndex - 1
          },
        },
      },
    ];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: {
        requests,
      },
    });

    return response.data;
  }

  async formatRow(rowIndex, startColumnIndex, endColumnIndex, color: string) {
    const sheets = await this.getSheets();

    const sheetIdNumber = await this.getSheetId();

    const backgroundColor = ColorService.hexToRgb(color);

    const request = {
      spreadsheetId: this.sheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetIdNumber,
                startRowIndex: rowIndex - 1, // Google Sheets is zero-indexed, so subtract 1
                endRowIndex: rowIndex,
                startColumnIndex: startColumnIndex - 1, // If you want to target specific columns (e.g. A = 0, B = 1)
                endColumnIndex: endColumnIndex, // Exclusive range, so end column + 1
              },
              cell: {
                userEnteredFormat: {
                  horizontalAlignment: 'CENTER',
                  textFormat: {
                    bold: true,
                  },
                  backgroundColor,
                },
              },
              fields:
                'userEnteredFormat(horizontalAlignment, textFormat.bold, backgroundColor)',
            },
          },
        ],
      },
      auth: this.auth,
    };

    const response = await sheets.spreadsheets.batchUpdate(request);

    return response.data;
  }
}
