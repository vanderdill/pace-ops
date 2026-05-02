import { Component, Input, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, TooltipItem } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-yearly-distance-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #distanceChart class="w-full h-full"></canvas>`,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `]
})
export class YearlyDistanceChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('distanceChart')
  private distanceChartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  private _data: { year: number; distance: number }[] = [];

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
  public set data(value: { year: number; distance: number }[]) {
    this._data = value;
    if (this.distanceChartCanvas) {
      this.updateChart(value);
    }
  }

  public get data(): { year: number; distance: number }[] {
    return this._data;
  }

  private updateChart(data: { year: number; distance: number }[]): void {
    if (!this.distanceChartCanvas) return;

    const ctx = this.distanceChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const stravaColor = this.getThemeColor('--color-strava');
    const cardBgColor = this.getThemeColor('--color-card-bg');
    const textMutedColor = this.getThemeColor('--color-text-muted');
    const textLightColor = this.getThemeColor('--color-text-light');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.year.toString()),
        datasets: [{
          label: 'Total Kilometers',
          data: data.map(d => d.distance),
          backgroundColor: stravaColor,
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
              label: (context: TooltipItem<'bar'>) => ` ${context.parsed.y} km`
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
              callback: (value: string | number) => `${value} km`
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
