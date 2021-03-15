import { Chart } from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { InputAdPoint } from './InputTextFileReader';
import { LogEntry } from './LogTextFileReader';
import { OutputAdRect } from './OutputTextFileReader';
import { State } from './State';

const canvasId = 'canvas-score-chart';

export class InnerReproducer {
  private state: State;
  // private inputAdPoints: InputAdPoint[];
  // private outputAdRects: OutputAdRect[];
  private logEntries: LogEntry[];
  public revLogEntries: LogEntry[] = [];

  private n: number;
  private scoreData: { x: number; y: number }[] = [];
  private lossData: { x: number; y: number }[] = [];
  private timeData: { x: number; y: number }[] = [];

  private chart?: Chart;
  private onChartClick: (index: number) => void;

  constructor(
    inputAdPoints: InputAdPoint[],
    outputAdRects: OutputAdRect[],
    logEntries: LogEntry[],
    onChartClick: (index: number) => void
  ) {
    this.state = new State(inputAdPoints, outputAdRects, logEntries, false);
    this.n = logEntries.length;

    // this.inputAdPoints = inputAdPoints;
    // this.outputAdRects = outputAdRects;
    this.logEntries = logEntries;

    void this.initScoreSeries();
    this.chart = undefined;
    this.onChartClick = onChartClick;
  }

  initScoreSeries(): void {
    const scoreRatio = 1e9;
    this.scoreData = [{ x: 0, y: this.state.score / scoreRatio }];
    this.lossData = [{ x: 0, y: scoreRatio - this.state.score }];
    this.timeData = [{ x: 0, y: 0 }];
    this.revLogEntries = [];
    // let oldScore = this.state.score;
    for (let i = 0; i < this.n; ++i) {
      const revLogEntry: LogEntry = this.state.applyLogEntry(i);
      void this.revLogEntries.push(revLogEntry);
      if (i % 200 === 0) {
        void this.scoreData.push({
          x: i + 1,
          y: this.state.score / scoreRatio,
        });
        void this.lossData.push({ x: i + 1, y: scoreRatio - this.state.score });
        void this.timeData.push({ x: i + 1, y: this.logEntries[i].msElapsed });
      }
      // if (i % 1000 == 0) {
      //     console.log(i, this.state.score / oldScore);
      //     oldScore = this.state.score;
      // }
    }
  }

  initCanvas(): HTMLCanvasElement {
    const canvas: HTMLCanvasElement = document.getElementById(
      canvasId
    ) as HTMLCanvasElement;
    const parent = canvas.parentElement as HTMLDivElement;
    void parent.removeChild(canvas);

    const newCanvas: HTMLCanvasElement = document.createElement('canvas');
    newCanvas.id = canvasId;
    newCanvas.width = 550;
    newCanvas.height = 400;
    void parent.appendChild(newCanvas);
    return newCanvas;
  }

  initChart(): void {
    if (this.chart !== undefined) {
      this.chart.clear();
      this.chart.destroy();
      delete this.chart;
      this.chart = undefined;
    }

    const canvas: HTMLCanvasElement = this.initCanvas();
    this.chart = new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [
          // {
          //     label: 'score [x1e9]',
          //     showLine: true,
          //     data: this.scoreData,
          //     pointRadius: 2,
          //     yAxisID: 'y-axis-score',
          //     borderColor: "rgba(254,97,132,0.8)",
          //     backgroundColor: "transparent",
          // },
          {
            label: 'loss [pt]',
            showLine: true,
            data: this.lossData,
            pointRadius: 2,
            yAxisID: 'y-axis-loss',
            borderColor: 'rgba(254,97,132,0.8)',
            backgroundColor: 'transparent',
          },
          {
            label: 'time [ms]',
            showLine: true,
            data: this.timeData,
            pointRadius: 2,
            yAxisID: 'y-axis-time',
            borderColor: 'rgba(54,164,235,0.8)',
            backgroundColor: 'transparent',
          },
        ],
      },
      options: {
        scales: {
          xAxes: [
            {
              id: 'x-axis-step',
              ticks: {
                suggestedMin: 0,
                suggestedMax: this.n,
              },
            },
          ],
          yAxes: [
            // {
            //     id: 'y-axis-score',
            //     position: 'left',
            // },
            {
              id: 'y-axis-loss',
              position: 'left',
              type: 'logarithmic',
            },
            {
              id: 'y-axis-time',
              position: 'right',
            },
          ],
        },
        hover: {
          mode: 'x',
        },
        onClick: (
          _event?: MouseEvent,
          activeElements?: Array<{ _datasetIndex: number; _index: number }>
        ): void => {
          if (!activeElements || activeElements.length === 0) return;
          const element = activeElements[0];
          const chartDataSets = this.chart?.data
            .datasets as Chart.ChartDataSets[];
          const points = chartDataSets[element._datasetIndex]
            .data as Chart.ChartPoint[];
          const point: Chart.ChartPoint = points[
            element._index
          ] as Chart.ChartPoint;
          this.onChartClick(point.x as number);
        },
        annotation: {
          annotations: [
            {
              id: 'curpos',
              type: 'line',
              mode: 'vertical',
              scaleID: 'x-axis-step',
              borderColor: 'green',
              borderWidth: 1,
              value: 0,
            },
          ],
        },
      },
      plugins: [ChartAnnotation],
    });
  }

  updateAnnotation(value: number): void {
    (this.chart as any).annotation.elements['curpos'].options.value = value;
    this.chart?.update({ duration: 0 });
  }
}
