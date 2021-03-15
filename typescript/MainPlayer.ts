import * as PIXI from 'pixi.js';
import { Animator } from './Animator';
import { InputTextFileReader } from './InputTextFileReader';
import { OutputTextFileReader } from './OutputTextFileReader';
import { LogTextFileReader } from './LogTextFileReader';
import { State } from './State';
import { InnerReproducer } from './InnerReproducer';

export class MainPlayer {
  private isInitialized: boolean = false;
  private isPlaying: boolean = false;
  private ptr: number = 0;
  /** ログの行数＝焼き鈍しのステップ数 */
  private ln: number = 0;

  private rangeInput: HTMLInputElement;
  private percentageSpan: HTMLSpanElement;
  private scoreSpan: HTMLSpanElement;
  private colorMapNameSelect: HTMLSelectElement;
  private speedInput: HTMLInputElement;
  private disableChartUpdateInput: HTMLInputElement;
  private playButton: HTMLButtonElement;
  private loadButton: HTMLButtonElement;

  private state!: State;
  private stepPerFrame: number = 100;
  private disableChartUpdate: boolean = false;

  private inputTextFileReader: InputTextFileReader;
  private outputTextFileReader: OutputTextFileReader;
  private logTextFileReader: LogTextFileReader;

  private animator: Animator;

  private app: PIXI.Application;

  private innerReproducer!: InnerReproducer;

  constructor(app: PIXI.Application) {
    this.app = app;

    this.rangeInput = document.getElementById(
      'input-range'
    ) as HTMLInputElement;
    this.percentageSpan = document.getElementById(
      'span-percentage'
    ) as HTMLSpanElement;
    this.scoreSpan = document.getElementById('span-score') as HTMLSpanElement;
    this.colorMapNameSelect = document.getElementById(
      'select-colormap'
    ) as HTMLSelectElement;
    this.speedInput = document.getElementById(
      'number-speed'
    ) as HTMLInputElement;
    this.disableChartUpdateInput = document.getElementById(
      'checkbox-disable-chart-update'
    ) as HTMLInputElement;
    this.playButton = document.getElementById('btn-play') as HTMLButtonElement;
    this.loadButton = document.getElementById('btn-load') as HTMLButtonElement;

    this.inputTextFileReader = new InputTextFileReader('file-in');
    this.outputTextFileReader = new OutputTextFileReader('file-out');
    this.logTextFileReader = new LogTextFileReader('file-log');

    this.animator = new Animator(this.app);

    this.playButton.addEventListener('click', (): void => {
      if (!this.isPlaying) {
        this.play();
      } else {
        this.pause();
      }
    });

    this.loadButton.addEventListener('click', (): void => {
      if (this.isPlaying) return;
      this.initMainContainer();
    });

    this.rangeInput.addEventListener('input', (): void => {
      if (this.isPlaying) return;
      this.seek(Number(this.rangeInput.value));
    });

    this.speedInput.addEventListener('input', (): void => {
      this.stepPerFrame = Number(this.speedInput.value);
    });

    console.log(this.disableChartUpdateInput);
    this.disableChartUpdateInput.addEventListener('change', (): void => {
      console.log(this.disableChartUpdateInput.checked);
      this.disableChartUpdate = this.disableChartUpdateInput.checked;
    });

    (Array.from(
      document.getElementsByClassName('btn-play-diff-step')
    ) as HTMLButtonElement[]).forEach((btn: HTMLButtonElement) => {
      btn.addEventListener('click', (): void => {
        if (!this.isInitialized) return;
        if (this.isPlaying) return;
        if (this.ln === 0) return;
        const diffStep = Number(btn.dataset.diffStep);
        const targetStep = Math.max(0, Math.min(this.ln, this.ptr + diffStep));
        this.seek(targetStep);
      });
    });

    this.colorMapNameSelect.addEventListener('change', (): void => {
      if (!this.isInitialized) return;
      this.state.recolor(this.colorMapNameSelect.value);
    });
  }

  initMainContainer(): void {
    if (
      !this.inputTextFileReader.completed ||
      !this.outputTextFileReader.completed
    ) {
      alert('あらかじめテキストファイルを読み込んでください');
      return;
    }

    this.state = new State(
      this.inputTextFileReader.inputAdPoints,
      this.outputTextFileReader.outputAdRects,
      this.logTextFileReader.logEntries,
      true,
      this.colorMapNameSelect.value
    );
    this.ptr = 0;
    this.ln = this.logTextFileReader.logEntries.length;
    this.rangeInput.min = '0';
    this.rangeInput.max = `${this.ln}`;
    this.rangeInput.value = '0';
    this.stepPerFrame = Number(this.speedInput.value);

    this.innerReproducer = new InnerReproducer(
      this.inputTextFileReader.inputAdPoints,
      this.outputTextFileReader.outputAdRects,
      this.logTextFileReader.logEntries,
      (index: number): void => {
        this.seek(index);
      }
    );
    void this.innerReproducer.initChart();

    this.animator.removeAllDisplayObject();
    this.animator.clearListeners();

    const mainContainer: PIXI.Container = new PIXI.Container();
    void this.app.stage.addChild(mainContainer);
    void this.state.initGraphics(mainContainer);

    this.scoreSpan.innerText = `${this.state.score} (0 / ${this.ln})`;
    this.isInitialized = true;
  }

  play(): void {
    if (!this.isInitialized) return;
    if (this.isPlaying) return;
    if (this.ln === 0) return;

    if (this.ptr >= this.ln) {
      this.seek(0);
    }

    /** フレーム更新用処理 */
    const animate = (): void => {
      if (this.ptr >= this.ln) return;

      // stepPerFrame 個ぶん適用する
      for (let i = 0; i < this.stepPerFrame; ++i) {
        this.state.applyLogEntry(this.ptr++);
        if (this.ptr >= this.ln) break;
      }
      this.scoreSpan.innerText = `${this.state.score} (${this.ptr} / ${this.ln})`;
      this.rangeInput.value = `${this.ptr}`;
      this.percentageSpan.innerText = `${Math.round(
        (100 * this.ptr) / this.ln
      )}`;
      if (!this.disableChartUpdate) {
        this.innerReproducer.updateAnnotation(this.ptr);
      }

      if (this.ptr >= this.ln) {
        this.pause();
      }
    };

    this.playButton.innerText = 'Pause';
    this.loadButton.disabled = true;
    this.rangeInput.disabled = true;
    this.isPlaying = true;

    void this.animator.addListener(animate);
  }

  pause(): void {
    if (!this.isInitialized) return;
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.playButton.innerText = 'Play';
    this.loadButton.disabled = false;
    this.rangeInput.disabled = false;

    void this.animator.clearListeners();
  }

  seek(step: number): void {
    if (!this.isInitialized) return;
    if (this.isPlaying) return;
    if (this.ln === 0) return;
    if (step === this.ptr) return;

    if (step > this.ptr) {
      while (this.ptr < step) {
        this.state.applyLogEntry(this.ptr++);
      }
    } else {
      while (this.ptr > step) {
        this.state.applyLogEntryInstance(
          this.innerReproducer.revLogEntries[--this.ptr]
        );
      }
    }
    this.scoreSpan.innerText = `${this.state.score} (${this.ptr} / ${this.ln})`;
    this.rangeInput.value = `${this.ptr}`;
    this.percentageSpan.innerText = `${Math.round((100 * this.ptr) / this.ln)}`;
    if (!this.disableChartUpdate) {
      this.innerReproducer.updateAnnotation(this.ptr);
    }
  }
}
