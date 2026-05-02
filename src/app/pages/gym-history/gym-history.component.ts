import { Component, inject, OnInit, ViewChild, ElementRef, effect, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GymHistoryStore } from './gym-history.store';
import { Chart, registerables, TooltipItem } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-gym-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gym-history.component.html'
})
export class GymHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('historyChart')
  private historyChartCanvas?: ElementRef<HTMLCanvasElement>;

  protected readonly store = inject(GymHistoryStore);
  
  private chart?: Chart;

  constructor() {
    effect(() => {
      const data = this.store.yearlySessions();
      if (data.length > 0) {
        this.updateChart(data);
      }
    });
  }

  public ngOnInit(): void {
    this.store.loadActivities();
  }

  public ngAfterViewInit(): void {
    // Chart will be initialized when data arrives via effect
  }

  public ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private updateChart(data: { year: number; count: number }[]): void {
    if (!this.historyChartCanvas) return;

    const ctx = this.historyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.year.toString()),
        datasets: [{
          label: 'Total Sessions',
          data: data.map(d => d.count),
          backgroundColor: '#06b6d4', // Cyan 500
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
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
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
              color: '#94a3b8',
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
              color: '#94a3b8',
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
}
