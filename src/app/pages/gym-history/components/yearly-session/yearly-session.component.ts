import { Component, Input, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, TooltipItem } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-yearly-session',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #historyChart class="w-full h-full"></canvas>`,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `]
})
export class YearlySessionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('historyChart')
  private historyChartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  private _data: { year: number; count: number }[] = [];

  public ngAfterViewInit(): void {
    if (this._data.length > 0) {
      this.updateChart(this._data);
    }
  }

  public ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  @Input()
  public set data(value: { year: number; count: number }[]) {
    this._data = value;
    if (this.historyChartCanvas) {
      this.updateChart(value);
    }
  }

  public get data(): { year: number; count: number }[] {
    return this._data;
  }

  private updateChart(data: { year: number; count: number }[]): void {
    if (!this.historyChartCanvas) return;

    const ctx = this.historyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const gymColor = this.getThemeColor('--color-gym');
    const cardBgColor = this.getThemeColor('--color-card-bg');
    const textMutedColor = this.getThemeColor('--color-text-muted');
    const textLightColor = this.getThemeColor('--color-text-light');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.year.toString()),
        datasets: [{
          label: 'Total Sessions',
          data: data.map(d => d.count),
          backgroundColor: gymColor,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: cardBgColor,
            titleColor: '#fff',
            bodyColor: textLightColor,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context: TooltipItem<'bar'>) => ` ${context.parsed.y} sessions`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textMutedColor,
              font: {
                family: 'Inter, sans-serif',
                size: 12,
                weight: 'bold'
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: textMutedColor,
              font: {
                family: 'Inter, sans-serif',
                size: 12
              },
              callback: (value: string | number) => `${value} sessions`
            }
          }
        }
      }
    });
  }

  private getThemeColor(variable: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }
}
