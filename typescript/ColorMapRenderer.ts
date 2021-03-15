import { ColorMap } from './ColorMap';

export class ColorMapRenderer {
  private leftOffset = 15;
  private topOffset = 5;
  private height = 50;
  constructor(canvasId: string, colorMap: ColorMap) {
    const canvasElement: HTMLCanvasElement = document.getElementById(
      canvasId
    ) as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvasElement.getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    ctx.fillStyle = 'black';
    void ctx.fillRect(
      this.leftOffset,
      this.topOffset,
      256 * 2 + 2,
      this.height + 2
    );

    for (let i = 0; i < 256; ++i) {
      const colorLabel = ('000000' + colorMap.get(i).toString(16)).substr(-6);
      ctx.fillStyle = `#${colorLabel}`;
      void ctx.fillRect(
        this.leftOffset + 1 + 2 * i,
        this.topOffset + 1,
        2,
        this.height
      );
    }

    ctx.fillStyle = `black`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let percentage = 0; percentage <= 200; percentage += 20) {
      const i = (128 * percentage) / 100;
      void ctx.fillRect(
        this.leftOffset + 2 * i,
        this.topOffset + this.height + 1,
        1,
        10
      );
      void ctx.fillText(
        `${percentage}%`,
        this.leftOffset + 2 * i,
        this.topOffset + this.height + 12
      );
    }
  }
}
