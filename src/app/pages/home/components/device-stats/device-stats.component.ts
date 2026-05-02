import { Component, Input, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, TooltipItem } from 'chart.js';
import { DeviceMonthlyDistribution } from '../../utils/device-monthly-stats.util';

Chart.register(...registerables);

@Component({
  selector: 'app-device-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card-bg p-8 rounded-3xl border border-white/5 h-full flex flex-col">
      <h3 class="text-xl font-bold mb-6">Device Usage Trends</h3>
      <div class="relative flex-1 min-h-[400px]">
        <canvas #deviceChart></canvas>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class DeviceStatsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('deviceChart')
  private deviceChartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  private _data?: DeviceMonthlyDistribution;

  public ngAfterViewInit(): void {
    if (this._data) {
      this.updateChart(this._data);
    }
  }

  public ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  @Input()
  public set data(value: DeviceMonthlyDistribution) {
    this._data = value;
    if (this.deviceChartCanvas) {
      this.updateChart(value);
    }
  }

  public get data(): DeviceMonthlyDistribution {
    return this._data!;
  }

  private updateChart(data: DeviceMonthlyDistribution): void {
    if (!this.deviceChartCanvas || !data) return;

    const ctx = this.deviceChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const textMutedColor = this.getThemeColor('--color-text-muted');
    const textLightColor = this.getThemeColor('--color-text-light');
    const cardBgColor = this.getThemeColor('--color-card-bg');

    // Vibrant palette
    const colors = [
      '#FC4C02', // Strava Orange
      '#00CED1', // Dark Turquoise
      '#9370DB', // Medium Purple
      '#FFD700', // Gold
      '#FF69B4', // Hot Pink
      '#32CD32', // Lime Green
      '#1E90FF', // Dodger Blue
      '#FF9800', // Deep Orange
      '#009688', // Teal
    ];

    const labels = data.months.map(m => this.formatMonth(m));

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: data.devices.map((device, index) => ({
          label: device.name,
          data: device.data,
          backgroundColor: colors[index % colors.length],
          borderColor: cardBgColor,
          borderWidth: 1,
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textMutedColor,
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                family: 'Inter, sans-serif',
                size: 11
              }
            }
          },
          tooltip: {
            backgroundColor: cardBgColor,
            titleColor: '#fff',
            bodyColor: textLightColor,
            padding: 12,
            cornerRadius: 12,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            displayColors: true,
            usePointStyle: true,
            callbacks: {
              label: (context: TooltipItem<'bar'>) => {
                const device = data.devices[context.datasetIndex];
                const percentage = device.data[context.dataIndex];
                const count = device.counts[context.dataIndex];
                return ` ${context.dataset.label}: ${percentage}% (${count} activities)`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false
            },
            ticks: {
              color: textMutedColor,
              font: {
                family: 'Inter, sans-serif',
                size: 10
              }
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: textMutedColor,
              callback: (value: string | number) => `${value}%`,
              font: {
                family: 'Inter, sans-serif',
                size: 11
              }
            }
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
