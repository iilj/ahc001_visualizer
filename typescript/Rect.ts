import * as PIXI from 'pixi.js';
import { InputAdPoint } from './InputTextFileReader';
import { OutputAdRect } from './OutputTextFileReader';
import { ColorMap } from './ColorMap';

const rectNumberTextStyle = new PIXI.TextStyle({
  fontSize: 24,
  fill: 0x000000,
  stroke: 0xffffff,
  strokeThickness: 4,
});

const percentageTextStyle = new PIXI.TextStyle({
  fontSize: 16,
  fill: 0x000000,
  stroke: 0xffffff,
  strokeThickness: 4,
});

const coordsTextStyle = new PIXI.TextStyle({
  fontSize: 16,
  fill: 0xff0000,
  stroke: 0xffffff,
  strokeThickness: 4,
});

export class Rect {
  public x: number;
  public y: number;
  public r: number;

  public left: number;
  public right: number;
  public top: number;
  public bottom: number;
  public score: number = 0;

  private index: number;

  private rectGraphics!: PIXI.Graphics;
  private text!: PIXI.Text;
  private inputAdPointGraphics!: PIXI.Graphics;
  private lineGraphics!: PIXI.Graphics;
  private percentageText!: PIXI.Text;
  private coordsText!: PIXI.Text;

  constructor(
    inputAdPoint: InputAdPoint,
    outputAdRect: OutputAdRect,
    index: number
  ) {
    this.x = inputAdPoint.x;
    this.y = inputAdPoint.y;
    this.r = inputAdPoint.r;

    this.left = outputAdRect.a;
    this.top = outputAdRect.b;
    this.right = outputAdRect.c;
    this.bottom = outputAdRect.d;

    this.index = index;

    void this.update_score();
  }

  update_score(): void {
    if (
      this.left <= this.x &&
      this.x < this.right &&
      this.top <= this.y &&
      this.y < this.bottom
    ) {
      const s: number = (this.right - this.left) * (this.bottom - this.top);
      const t: number = 1.0 - Math.min(this.r, s) / Math.max(this.r, s);
      this.score = 1.0 - t * t;
    } else {
      this.score = 0.0;
    }
  }

  initRectGraphics(container: PIXI.Container, colorMap: ColorMap): void {
    this.rectGraphics = new PIXI.Graphics();
    this.rectGraphics.interactive = true;
    this.updateRectGraphics(colorMap);
    void container.addChild(this.rectGraphics);

    this.rectGraphics.on('mouseover', () => {
      void container.addChild(this.coordsText);
    });
    this.rectGraphics.on('mouseout', () => {
      void container.removeChild(this.coordsText);
    });
  }

  updateRectGraphics(colorMap: ColorMap): void {
    this.rectGraphics.clear();

    // サイズと座標を設定
    const w = (this.right - this.left) / 10;
    const h = (this.bottom - this.top) / 10;
    this.rectGraphics.width = w;
    this.rectGraphics.height = h;
    this.rectGraphics.x = this.left / 10;
    this.rectGraphics.y = this.top / 10;

    const surface = (this.right - this.left) * (this.bottom - this.top);
    const colorIndex = Math.min(255, Math.round((128 * surface) / this.r));

    // 枠と塗り潰し
    this.rectGraphics.beginFill(0x000000).drawRect(0, 0, w, h).endFill();
    if (w >= 3 && h >= 3) {
      this.rectGraphics
        .beginFill(colorMap.get(colorIndex))
        .drawRect(1, 1, w - 2, h - 2)
        .endFill();
    }
  }

  initText(container: PIXI.Container): void {
    this.text = new PIXI.Text(String(this.index), rectNumberTextStyle);
    this.percentageText = new PIXI.Text('', percentageTextStyle);
    this.coordsText = new PIXI.Text('', coordsTextStyle);
    this.updateText();

    void container.addChild(this.text);
    void container.addChild(this.percentageText);
  }

  updateText(): void {
    this.text.x = (this.right + this.left) / 2 / 10;
    this.text.y = (this.bottom + this.top) / 2 / 10;
    this.text.anchor.x = 0.5;
    this.text.anchor.y = 0.5;

    const surface = (this.right - this.left) * (this.bottom - this.top);
    const percentage = Math.round((100 * surface) / this.r);

    this.percentageText.text = `${percentage}%`;
    this.percentageText.x = (this.right + this.left) / 2 / 10;
    this.percentageText.y = (this.bottom + this.top) / 2 / 10 + 28;
    this.percentageText.anchor.x = 0.5;
    this.percentageText.anchor.y = 1.0;

    // 座標値テキスト
    this.coordsText.x = this.x < 5000 ? this.left / 10 : this.right / 10;
    this.coordsText.y = this.y < 5000 ? this.top / 10 : this.bottom / 10;
    this.coordsText.text =
      `(${this.left}, ${this.top})\n` +
      `(${this.x}, ${this.y})\n` +
      `(${this.right}, ${this.bottom})\n` +
      `${surface} / ${this.r}, ${this.score}`;
    this.coordsText.anchor.x = this.x < 5000 ? 0 : 1;
    this.coordsText.anchor.y = this.y < 5000 ? 0 : 1;
  }

  initInputAdPointGraphics(container: PIXI.Container): void {
    this.inputAdPointGraphics = new PIXI.Graphics();
    this.inputAdPointGraphics
      .beginFill(0x008000)
      .drawRect(this.x / 10 - 3, this.y / 10 - 3, 7, 7)
      .endFill();
    void container.addChild(this.inputAdPointGraphics);

    this.lineGraphics = new PIXI.Graphics();
    this.updateInputAdPointGraphics();
    void container.addChild(this.lineGraphics);
  }

  updateInputAdPointGraphics(): void {
    this.lineGraphics.clear();
    this.lineGraphics
      .lineStyle(1, 0x000000)
      .moveTo(this.x / 10, this.y / 10)
      .lineTo(
        (this.right + this.left) / 2 / 10,
        (this.bottom + this.top) / 2 / 10
      );
  }

  updateGraphics(colorMap: ColorMap): void {
    this.updateRectGraphics(colorMap);
    this.updateText();
    this.updateInputAdPointGraphics();
  }
} // end class Rect
