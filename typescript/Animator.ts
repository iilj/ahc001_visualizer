import * as PIXI from 'pixi.js';

/**
 * シーンの変化を管理するクラス
 *
 * @date 2021-03-07
 * @export
 * @class Animator
 */
export class Animator {
  /** 登録解除用にリスナを控えておく */
  private listeners: (() => void)[] = [];
  private app: PIXI.Application;

  constructor(app: PIXI.Application) {
    this.app = app;
  }

  /** リスナを追加する */
  addListener(listenerFunction: () => void): void {
    this.app.ticker.add(listenerFunction);
    this.listeners.push(listenerFunction);
  }

  /** リスナをすべて削除する */
  clearListeners(): void {
    this.listeners.forEach((listener: () => void): void => {
      this.app.ticker.remove(listener);
    });
    this.listeners = [];
  }

  /** すべての displayObject を削除する */
  removeAllDisplayObject(): void {
    for (const displayObject of this.app.stage.children) {
      this.app.stage.removeChild(displayObject);
    }
  }
}
