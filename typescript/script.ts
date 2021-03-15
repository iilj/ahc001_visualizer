import * as PIXI from 'pixi.js';
import { MainPlayer } from './MainPlayer';

// ゲーム内の画面サイズを設定
const app: PIXI.Application = new PIXI.Application({
  width: 1000,
  height: 1000,
});
{
  // app.view (<canvas> 要素) を追加する
  void (document.getElementById(
    'div-canvas-parent'
  ) as HTMLCanvasElement).appendChild<HTMLCanvasElement>(app.view);

  // canvas スタイルを設定する．実際に画面に表示するサイズ (width, height) はここで設定．
  app.renderer.view.style.position = 'relative';
  app.renderer.view.style.width = '700px';
  app.renderer.view.style.height = '700px';
  app.renderer.view.style.display = 'block';
  app.renderer.view.style.border = '1px solid black';

  // canvas の背景色を設定
  app.renderer.backgroundColor = 0xefefef;
}

// プリロード処理が終わったら呼び出されるイベント
PIXI.Loader.shared.load(() => {
  new MainPlayer(app);
});
