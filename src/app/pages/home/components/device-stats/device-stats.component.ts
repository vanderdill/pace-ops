import { Component, Input, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-device-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card-bg p-8 rounded-3xl border border-white/5 h-full flex flex-col">
      <h3 class="text-xl font-bold mb-6">Activities by Device</h3>
      <div class="relative flex-1 min-h-[300px]">
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

  private _data: { name: string; count: number }[] = [];

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
  public set data(value: { name: string; count: number }[]) {
    this._data = value;
    if (this.deviceChartCanvas) {
      this.updateChart(value);
    }
  }

  public get data(): { name: string; count: number }[] {
    return this._data;
  }

  private updateChart(data: { name: string; count: number }[]): void {
    if (!this.deviceChartCanvas) return;

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
    ];

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: colors,
          borderColor: cardBgColor,
          borderWidth: 4,
          hoverOffset: 15,
          spacing: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
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
                size: 12
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
              label: (context) => ` ${context.label}: ${context.parsed} activities`
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
