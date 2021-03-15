import * as PIXI from 'pixi.js';
import { InputAdPoint } from './InputTextFileReader';
import { OutputAdRect } from './OutputTextFileReader';
import { LogEntry } from './LogTextFileReader';
import { ColorMap } from './ColorMap';
import { ColorMapRenderer } from './ColorMapRenderer';
import { Rect } from './Rect';

export class State {
  public rects: Rect[];
  public n: number;
  public rawScore: number;
  public score: number;

  private colorMap?: ColorMap;
  private logEntries: LogEntry[];
  private useGraphics: boolean;

  constructor(
    inputAdPoints: InputAdPoint[],
    outputAdRects: OutputAdRect[],
    logEntries: LogEntry[],
    useGraphics: boolean = true,
    colorMapName: string = 'vis'
  ) {
    if (inputAdPoints.length !== outputAdRects.length) {
      const msg: string = '入出力サイズが一致しません';
      void alert(msg);
      throw msg;
    }
    this.n = inputAdPoints.length;
    this.rects = inputAdPoints.map(
      (inputAdPoint: InputAdPoint, index: number): Rect => {
        const outputAdRect = outputAdRects[index];
        return new Rect(inputAdPoint, outputAdRect, index);
      }
    );
    this.rawScore = this.rects.reduce(
      (prevScore: number, rect: Rect): number => {
        return prevScore + rect.score;
      },
      0.0
    );
    this.score = Math.round((1e9 * this.rawScore) / this.n);
    this.logEntries = logEntries;

    this.useGraphics = useGraphics;
    if (this.useGraphics) {
      this.colorMap = new ColorMap(colorMapName);
      new ColorMapRenderer('canvas-color-map', this.colorMap);
    }
  }

  initGraphics(container: PIXI.Container): void {
    void this.rects.map((rect) => {
      if (this.colorMap === undefined) return;
      void rect.initRectGraphics(container, this.colorMap);
    });
    void this.rects.map((rect) => {
      void rect.initText(container);
    });
    void this.rects.map((rect) => {
      void rect.initInputAdPointGraphics(container);
    });
  }

  applyLogEntry(index: number): LogEntry {
    const logEntry: LogEntry = this.logEntries[index];
    const targetRect: Rect = this.rects[logEntry.index];

    const revLogEntry: LogEntry = new LogEntry(
      logEntry.index,
      targetRect.left,
      targetRect.top,
      targetRect.right,
      targetRect.bottom,
      logEntry.msElapsed
    );

    void this.applyLogEntryInstance(logEntry);
    return revLogEntry;
  }

  applyLogEntryInstance(logEntry: LogEntry): void {
    const targetRect: Rect = this.rects[logEntry.index];

    targetRect.left = logEntry.a;
    targetRect.top = logEntry.b;
    targetRect.right = logEntry.c;
    targetRect.bottom = logEntry.d;

    const oldScore: number = targetRect.score;
    void targetRect.update_score();
    this.rawScore += targetRect.score - oldScore;
    this.score = Math.round((1e9 * this.rawScore) / this.n);

    if (this.useGraphics && this.colorMap) {
      void targetRect.updateGraphics(this.colorMap);
    }
  }

  recolor(colorMapName: string = 'vis'): void {
    if (!this.useGraphics || !this.colorMap) return;
    this.colorMap = new ColorMap(colorMapName);
    new ColorMapRenderer('canvas-color-map', this.colorMap);
    void this.rects.map((rect) => {
      if (this.colorMap === undefined) return;
      void rect.updateGraphics(this.colorMap);
    });
  }
} // end class State
