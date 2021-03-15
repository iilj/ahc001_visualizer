import { TextFileReader } from './TextFileReader';

export class OutputAdRect {
  /** 頂点 1 の x 座標，[0, 9999] の整数 */
  public a: number;
  /** 頂点 1 の y 座標，[0, 9999] の整数 */
  public b: number;
  /** 頂点 2 の x 座標，[0, 9999] の整数 */
  public c: number;
  /** 頂点 2 の y 座標，[0, 9999] の整数 */
  public d: number;

  constructor(a: number, b: number, c: number, d: number) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }
}

export class OutputTextFileReader {
  private textFileReader: TextFileReader;
  public completed: boolean;
  public outputAdRects: OutputAdRect[] = [];

  constructor(elementId: string) {
    this.completed = false;

    const onCompleted = (): void => {
      const lines = this.textFileReader.result.trim().split('\n');

      if (lines.length === 0) {
        const msg: string = 'ファイルが不正です';
        void alert(msg);
        throw msg;
      }
      this.outputAdRects = lines.map(
        (line: string): OutputAdRect => {
          const args: number[] = line
            .split(' ')
            .map((num: string): number => Number(num));
          if (args.length !== 4) {
            const msg: string = `座標値の指定がおかしいです: ${line}`;
            void alert(msg);
            throw msg;
          }
          return new OutputAdRect(
            ...(args as [number, number, number, number])
          );
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
