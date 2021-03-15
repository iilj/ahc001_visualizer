/**
 * カラーマップクラス
 * 参考：カラーマップ | GHP（仮） http://mclab.uunyan.com/lab/html/canvas005.htm
 *
 * @date 2021-03-07
 * @export
 * @class ColorMap
 */
export class ColorMap {
  private colors: { r: Uint8Array; g: Uint8Array; b: Uint8Array };

  constructor(colorName: string = '') {
    this.colors = {
      r: new Uint8Array(256),
      g: new Uint8Array(256),
      b: new Uint8Array(256),
    };
    let r: number, g: number, b: number;
    switch (colorName) {
      case 'vis':
        for (let i = 0; i < 256; i++) {
          const tmp = Math.round(
            (-Math.cos((2.0 * Math.PI * i) / 255) / 2.0 + 0.5) * 255.0
          );
          if (i >= 128) {
            r = 255;
            b = tmp;
          } else {
            r = tmp;
            b = 255;
          }

          this.colors.r[i] = r;
          this.colors.g[i] = 0;
          this.colors.b[i] = b;
        }
        break;

      // jet-color
      // https://github.com/timmysiauw/jet-color
      case 'jet':
        for (let i = 0; i < 256; i++) {
          r = Math.min(255, 4 * (i - 96), 255 - 4 * (i - 224));
          r = r < 0 ? 0 : r;

          g = Math.min(255, 4 * (i - 32), 255 - 4 * (i - 160));
          g = g < 0 ? 0 : g;

          b = Math.min(255, 4 * i + 127, 255 - 4 * (i - 96));
          b = b < 0 ? 0 : b;

          this.colors.r[i] = r;
          this.colors.g[i] = g;
          this.colors.b[i] = b;
        }
        break;

      // HSVからRGBへの変換プログラム
      // https://qiita.com/hachisukansw/items/633d1bf6baf008e82847
      case 'hsv': {
        const s = 1.0;
        const v = 1.0;
        const c = v * s;
        r = g = b = 0;

        for (let i = 0; i < 256; i = i + 1) {
          const h = i / 255;
          const hp = h * 6.0;
          const x = c * (1 - Math.abs((hp % 2) - 1));

          if (0 <= hp && hp < 1) {
            [r, g, b] = [c, x, 0];
          }
          if (1 <= hp && hp < 2) {
            [r, g, b] = [x, c, 0];
          }
          if (2 <= hp && hp < 3) {
            [r, g, b] = [0, c, x];
          }
          if (3 <= hp && hp < 4) {
            [r, g, b] = [0, x, c];
          }
          if (4 <= hp && hp < 5) {
            [r, g, b] = [x, 0, c];
          }
          if (5 <= hp && hp < 6) {
            [r, g, b] = [c, 0, x];
          }
          const m = v - c;
          [r, g, b] = [r + m, g + m, b + m];

          this.colors.r[i] = Math.floor(r * 255);
          this.colors.g[i] = Math.floor(g * 255);
          this.colors.b[i] = Math.floor(b * 255);
        }
        break;
      }
      case 'hot':
        for (let i = 0; i < 256; i++) {
          r = Math.round(i * 2.55);
          g = 0;
          b = 0;
          if (r >= 255) {
            r = 255;
            g = Math.round((i - 100) * 2.55);
            if (g >= 255) {
              g = 255;
              b = Math.round((i - 200) * (255 / 55));
            }
          }
          this.colors.r[i] = r;
          this.colors.g[i] = g;
          this.colors.b[i] = b;
        }
        break;

      case 'cool':
        for (let i = 0; i < 256; i++) {
          this.colors.r[i] = i;
          this.colors.g[i] = 255 - i;
          this.colors.b[i] = 255;
        }
        break;

      case 'spring':
        for (let i = 0; i < 256; i++) {
          this.colors.r[i] = 255;
          this.colors.g[i] = i;
          this.colors.b[i] = 255 - i;
        }
        break;

      case 'summer':
        for (let i = 0; i < 256; i++) {
          this.colors.r[i] = i;
          this.colors.g[i] = 128 + Math.floor(i / 2);
          this.colors.b[i] = 102;
        }
        break;

      case 'autumn':
        for (let i = 0; i < 256; i++) {
          this.colors.r[i] = 255;
          this.colors.g[i] = i;
          this.colors.b[i] = 0;
        }
        break;

      case 'winter':
        for (let i = 0; i < 256; i++) {
          this.colors.r[i] = 0;
          this.colors.g[i] = i;
          this.colors.b[i] = 255 - i / 2;
        }
        break;

      //	グレースケール
      case 'gray':
        for (let i = 0; i < 256; i++) {
          this.colors.r[i] = i;
          this.colors.g[i] = i;
          this.colors.b[i] = i;
        }
        break;

      default:
        for (let i = 0; i < 256; i++) {
          this.colors.r[i] = i;
          this.colors.g[i] = i;
          this.colors.b[i] = i;
        }
        break;
    }
  }

  get(index: number): number {
    if (index < 0 || 255 < index) {
      throw 'インデックスが不正です';
    }
    return (
      0x010000 * this.colors.r[index] +
      0x000100 * this.colors.g[index] +
      this.colors.b[index]
    );
  }
}
