import { Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { GoogleAuth, Compute } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { SheetConvertorService } from 'src/utils/services/sheet-convert.service';
import { LocalCache } from 'src/utils/services/local-cache.service';

@Injectable()
export class SheetService {
  private auth: GoogleAuth;
  private readonly sheetId: string;

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

  async addSheetData(
    data: string[],
  ): Promise<sheets_v4.Schema$AppendValuesResponse> {
    const sheets = await this.getSheets();

    const response = await sheets.spreadsheets.values.append({
      auth: this.auth,
      spreadsheetId: this.sheetId,
      range: 'Sheet1!A1:B2', // TODO: Find a way to get the last row
      valueInputOption: 'RAW',
      requestBody: {
        values: [data],
      },
    });

    return response.data;
  }

  async updateSheetData(
    data: string[],
  ): Promise<sheets_v4.Schema$UpdateValuesResponse> {
    const sheets = await this.getSheets();

    const response = await sheets.spreadsheets.values.update({
      auth: this.auth,
      spreadsheetId: this.sheetId,
      range: 'Sheet1!A1:B2', // TODO: Find a way to get the last row
      valueInputOption: 'RAW',
      requestBody: {
        values: [data],
      },
    });

    return response.data;
  }

  async deleteSheetData(
    data: string[],
  ): Promise<sheets_v4.Schema$ClearValuesResponse> {
    const sheets = await this.getSheets();

    const response = await sheets.spreadsheets.values.clear({
      auth: this.auth,
      spreadsheetId: this.sheetId,
      range: 'Sheet1!A1:B2', // TODO: Find a way to get the last row
    });

    return response.data;
  }
}
