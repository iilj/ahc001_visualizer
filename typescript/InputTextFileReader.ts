import { TextFileReader } from './TextFileReader';

export class InputAdPoint {
  /** x 座標，[0, 9999] の整数 */
  public x: number;
  /** y 座標，[0, 9999] の整数 */
  public y: number;
  /** 希望面積，1 以上の整数 */
  public r: number;

  constructor(x: number, y: number, r: number) {
    this.x = x;
    this.y = y;
    this.r = r;
  }
}

export class InputTextFileReader {
  private textFileReader: TextFileReader;
  public completed: boolean;
  public n: number;
  public inputAdPoints: InputAdPoint[] = [];

  constructor(elementId: string) {
    this.n = -1;
    this.completed = false;

    const onCompleted = (): void => {
      const lines = this.textFileReader.result.trim().split('\n');

      if (lines.length < 2) {
        const msg: string = 'ファイルが不正です';
        void alert(msg);
        throw msg;
      }
      this.n = Number(lines[0]);
      if (lines.length !== this.n + 1) {
        const msg: string = `ファイルの行数がおかしいです: n=${this.n}, length=${lines.length}`;
        void alert(msg);
        throw msg;
      }
      this.inputAdPoints = lines.slice(1).map(
        (line: string): InputAdPoint => {
          const args: number[] = line
            .split(' ')
            .map((num: string): number => Number(num));
          if (args.length !== 3) {
            const msg: string = `座標値の指定がおかしいです: ${line}`;
            void alert(msg);
            throw msg;
          }
          return new InputAdPoint(...(args as [number, number, number]));
        }
      );

      this.completed = true;
    };
    const onFailed = (): void => {
      this.completed = false;
    };
    this.textFileReader = new TextFileReader(elementId, onCompleted, onFailed);
  }
}
