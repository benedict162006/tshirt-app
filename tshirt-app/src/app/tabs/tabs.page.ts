import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { gridOutline, heartOutline, homeOutline, personOutline } from 'ionicons/icons';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  private cartService = inject(CartService);

  constructor() {
    addIcons({ gridOutline, heartOutline, homeOutline, personOutline });
  }

  activateHomeTab(): void {
    this.cartService.activateHomeTab();
  }

  onTabsChange(event: { tab: string }): void {
    if (event.tab === 'tab1') this.activateHomeTab();
  }
}
