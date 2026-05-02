import { Component, Input, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, TooltipItem } from 'chart.js';
import { MonthlyHrStats } from '../../../pages/home/utils/monthly-hr-stats.util';

Chart.register(...registerables);

@Component({
  selector: 'app-monthly-hr-stats-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #hrChart class="w-full h-full"></canvas>`,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `]
})
export class MonthlyHrStatsChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('hrChart')
  private hrChartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  private _data: MonthlyHrStats[] = [];

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
  public set data(value: MonthlyHrStats[]) {
    this._data = value;
    if (this.hrChartCanvas) {
      this.updateChart(value);
    }
  }

  public get data(): MonthlyHrStats[] {
    return this._data;
  }

  private updateChart(data: MonthlyHrStats[]): void {
    if (!this.hrChartCanvas) return;

    const ctx = this.hrChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const stravaColor = this.getThemeColor('--color-strava');
    const cyanColor = '#00CED1';
    const cardBgColor = this.getThemeColor('--color-card-bg');
    const textMutedColor = this.getThemeColor('--color-text-muted');
    const textLightColor = this.getThemeColor('--color-text-light');

    const labels = data.map(d => this.formatMonth(d.month));

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Max HR',
            data: data.map(d => d.maxHr),
            borderColor: stravaColor,
            backgroundColor: 'transparent',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: stravaColor,
            pointBorderColor: cardBgColor,
            pointBorderWidth: 2
          },
          {
            label: 'Avg HR',
            data: data.map(d => d.avgHr),
            borderColor: cyanColor,
            backgroundColor: 'transparent',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: cyanColor,
            pointBorderColor: cardBgColor,
            pointBorderWidth: 2
          },
          {
            label: 'Upper Bound',
            data: data.map(d => d.avgHr + d.stdDev),
            borderColor: 'transparent',
            backgroundColor: 'rgba(0, 206, 209, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0
          },
          {
            label: 'Lower Bound',
            data: data.map(d => d.avgHr - d.stdDev),
            borderColor: 'transparent',
            backgroundColor: 'rgba(0, 206, 209, 0.1)',
            fill: '-1', // Fill to Upper Bound
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: textMutedColor,
              usePointStyle: true,
              pointStyle: 'circle',
              filter: (item) => item.text !== 'Upper Bound' && item.text !== 'Lower Bound',
              font: {
                family: 'Inter, sans-serif',
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: cardBgColor,
            titleColor: '#fff',
            bodyColor: textLightColor,
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            usePointStyle: true,
            callbacks: {
              label: (context: TooltipItem<'line'>) => {
                const item = data[context.dataIndex];
                if (context.dataset.label === 'Max HR') return ` Peak: ${item.maxHr} bpm`;
                if (context.dataset.label === 'Avg HR') return ` Average: ${item.avgHr} bpm (±${item.stdDev})`;
                return '';
              }
            },
            filter: (item) => item.datasetIndex < 2
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textMutedColor,
              maxRotation: 45,
              minRotation: 45,
              font: {
                family: 'Inter, sans-serif',
                size: 10
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
              callback: (value: string | number) => `${value} bpm`
            },
            suggestedMin: 100
          }
        }
      }
    });
  }

  private formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }

  private getThemeColor(variable: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }
}
