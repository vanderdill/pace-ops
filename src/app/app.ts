import { Component, inject, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthService } from "./core/auth/auth.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  private readonly authService = inject(AuthService);
  protected readonly title = signal("pace-ops");
  protected readonly athlete = this.authService.getAthlete();

  protected login(): void {
    this.authService.login();
  }

  protected logout(): void {
    this.authService.logout();
  }
}
