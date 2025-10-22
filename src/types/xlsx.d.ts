declare module "xlsx" {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheet: string]: WorkSheet };
  }

  export interface WorkSheet {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [cell: string]: CellObject | any;
  }

  export interface CellObject {
    v: string | number | boolean | Date;
    t: "s" | "n" | "b" | "d" | "e";
    w?: string;
    f?: string;
    r?: string;
    h?: string;
    c?: object[];
  }

  export function read(data: ArrayBuffer | Uint8Array | string): WorkBook;

  export const utils: {
    sheet_to_json<T = Record<string, unknown>>(ws: WorkSheet): T[];
  };
}
