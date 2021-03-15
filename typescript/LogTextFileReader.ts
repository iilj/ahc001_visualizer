import { TextFileReader } from './TextFileReader';

export class LogEntry {
  /** 更新対象のインデックス */
  public index: number;
  /** 頂点 1 の x 座標，[0, 9999] の整数 */
  public a: number;
  /** 頂点 1 の y 座標，[0, 9999] の整数 */
  public b: number;
  /** 頂点 2 の x 座標，[0, 9999] の整数 */
  public c: number;
  /** 頂点 2 の y 座標，[0, 9999] の整数 */
  public d: number;
  /** 経過時間 [ms] */
  public msElapsed: number;

  constructor(
    index: number,
    a: number,
    b: number,
    c: number,
    d: number,
    msElapsed: number
  ) {
    this.index = index;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.msElapsed = msElapsed;
  }
}

export class LogTextFileReader {
  private textFileReader: TextFileReader;
  public completed: boolean;
  public logEntries: LogEntry[];

  constructor(elementId: string) {
    this.completed = false;
    this.logEntries = [];

    const onCompleted = (): void => {
      const lines = this.textFileReader.result.trim().split('\n');

      if (lines.length === 0) {
        this.completed = false;
        const msg: string = 'ファイルが不正です';
        void alert(msg);
        throw msg;
      }
      this.logEntries = lines
        .map((line: string): LogEntry | undefined => {
          const argsStr: string[] = line.split(' ');
          if (argsStr.length < 2) {
            this.completed = false;
            const msg: string = `形式がおかしいです: ${line}`;
            void alert(msg);
            throw msg;
          }
          if (argsStr[0] === '-1') {
            console.log(line);
            return undefined;
          }
          const args: number[] = argsStr.map((num: string): number =>
            Number(num)
          );
          if (args.length !== 6) {
            this.completed = false;
            throw '座標値の指定がおかしいです';
          }
          return new LogEntry(
            ...(args as [number, number, number, number, number, number])
          );
        })
        .filter((val) => val !== undefined) as LogEntry[];

      this.completed = true;
    };
    const onFailed = (): void => {
      this.completed = false;
      this.logEntries = [];
    };
    this.textFileReader = new TextFileReader(elementId, onCompleted, onFailed);
  }
}
