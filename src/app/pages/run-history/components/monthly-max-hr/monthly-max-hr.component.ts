import { Component, Input, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, TooltipItem } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-monthly-max-hr',
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
export class MonthlyMaxHrComponent implements AfterViewInit, OnDestroy {
  @ViewChild('hrChart')
  private hrChartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  private _data: { month: string; maxHr: number }[] = [];

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
  public set data(value: { month: string; maxHr: number }[]) {
    this._data = value;
    if (this.hrChartCanvas) {
      this.updateChart(value);
    }
  }

  public get data(): { month: string; maxHr: number }[] {
    return this._data;
  }

  private updateChart(data: { month: string; maxHr: number }[]): void {
    if (!this.hrChartCanvas) return;

    const ctx = this.hrChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const stravaColor = this.getThemeColor('--color-strava');
    const cardBgColor = this.getThemeColor('--color-card-bg');
    const textMutedColor = this.getThemeColor('--color-text-muted');
    const textLightColor = this.getThemeColor('--color-text-light');

    // Create gradient for the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(252, 76, 2, 0.4)');
    gradient.addColorStop(1, 'rgba(252, 76, 2, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => this.formatMonth(d.month)),
        datasets: [{
          label: 'Max Heart Rate',
          data: data.map(d => d.maxHr),
          borderColor: stravaColor,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: stravaColor,
          pointBorderColor: cardBgColor,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
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
              label: (context: TooltipItem<'line'>) => ` ${context.parsed.y} bpm`
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
            suggestedMin: 120 // Common range for running HR
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
