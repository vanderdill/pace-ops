import { Component, Input, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, TooltipItem } from 'chart.js';
import { MonthlyDistribution } from '../../models/monthly-distribution.model';

Chart.register(...registerables);

@Component({
  selector: 'app-stacked-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card-bg p-8 rounded-3xl border border-white/5 h-full flex flex-col">
      <h3 class="text-xl font-bold mb-6">{{ title }}</h3>
      <div class="relative flex-1 min-h-[400px]">
        <canvas #chartCanvas></canvas>
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
export class StackedBarChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas')
  private chartCanvas?: ElementRef<HTMLCanvasElement>;

  @Input() public title: string = 'Trends';
  
  private chart?: Chart;
  private _data?: MonthlyDistribution;

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
  public set data(value: MonthlyDistribution | undefined) {
    this._data = value;
    if (this.chartCanvas) {
      this.updateChart(value);
    }
  }

  public get data(): MonthlyDistribution | undefined {
    return this._data;
  }

  private updateChart(data: MonthlyDistribution | undefined): void {
    if (!this.chartCanvas || !data) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const textMutedColor = this.getThemeColor('--color-text-muted');
    const textLightColor = this.getThemeColor('--color-text-light');
    const cardBgColor = this.getThemeColor('--color-card-bg');

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
      '#673AB7', // Deep Purple
      '#E91E63', // Pink
      '#8BC34A', // Light Green
      '#3F51B5', // Indigo
    ];

    const labels = data.months.map(m => this.formatMonth(m));

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: data.series.map((s, index) => ({
          label: s.name,
          data: s.data,
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
                const s = data.series[context.datasetIndex];
                const percentage = s.data[context.dataIndex];
                const count = s.counts[context.dataIndex];
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
