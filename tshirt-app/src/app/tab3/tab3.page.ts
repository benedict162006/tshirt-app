import { Component, OnInit, inject } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonIcon
} from '@ionic/angular';
import { AlertController, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bagHandleOutline,
  cardOutline,
  chevronForwardOutline,
  createOutline,
  gridOutline,
  menuOutline,
  personCircle,
  personCircleOutline,
  refreshOutline,
  shirtOutline,
  trashOutline,
  trendingUpOutline
} from 'ionicons/icons';
import { CartService, OrderHistoryItem } from '../services/cart.service';

@Component({
  selector: 'app-tab3',
  templateUrl: './account.html',
  styleUrls: ['./account.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonIcon],
})
export class Tab3Page implements OnInit {
  // Mga datos na madaling i-edit
  userName: string = 'Sakura';
  lastUpdate: string = '16 Sep, 2026';
  salesRevenue: string = '45K';
  todayRevenue: string = '$234,890';
  subDays: number = 23;
  totalDays: number = 30;
  isSidebarOpen: boolean = true;
  activeSection = 'Overview';
  dashboardMessage = 'Overview is selected.';
  orderHistory: OrderHistoryItem[] = [];
  historyError = '';
  private cartService = inject(CartService);
  private alertController = inject(AlertController);
  private navCtrl = inject(NavController);

  constructor() {
    addIcons({
      bagHandleOutline,
      cardOutline,
      chevronForwardOutline,
      createOutline,
      gridOutline,
      menuOutline,
      personCircle,
      personCircleOutline,
      refreshOutline,
      shirtOutline,
      trashOutline,
      trendingUpOutline
    });
  }

  ngOnInit(): void {
    void this.loadOrderHistory();
  }

  async loadOrderHistory(): Promise<void> {
    this.historyError = '';
    try {
      this.orderHistory = await this.cartService.getOrderHistory();
    } catch (error) {
      const firestoreError = error as { code?: string };
      this.historyError = firestoreError.code === 'permission-denied'
        ? 'Walang read permission ang Firestore Rules.'
        : 'Hindi ma-load ang order history.';
    }
  }

  async confirmDeleteOrder(order: OrderHistoryItem): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete order?',
      message: `Tatanggalin ang ${order.name} mula sa Firestore history?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => void this.removeOrder(order.id)
        }
      ]
    });
    await alert.present();
  }

  async removeOrder(orderId: string): Promise<void> {
    const deleted = await this.cartService.deleteOrder(orderId);
    if (deleted) {
      this.orderHistory = this.orderHistory.filter((order) => order.id !== orderId);
    } else {
      this.historyError = 'Hindi ma-delete ang order. I-check ang Firestore Rules.';
    }
  }

  async editOrder(order: OrderHistoryItem): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Edit order',
      inputs: [
        { name: 'name', type: 'text', label: 'Item name', value: order.name },
        { name: 'quantity', type: 'number', label: 'Quantity', value: order.quantity, min: 1 },
        { name: 'paymentMethod', type: 'text', label: 'Payment method', value: order.paymentMethod },
        { name: 'shippingName', type: 'text', label: 'Shipping', value: order.shippingName }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: (data: { name: string; quantity: string; paymentMethod: string; shippingName: string }) => {
            const quantity = Number(data.quantity);
            if (!data.name?.trim() || !Number.isInteger(quantity) || quantity < 1) {
              this.historyError = 'Item name at quantity ay required.';
              return false;
            }
            void this.updateOrder(order, {
              name: data.name.trim(),
              quantity,
              paymentMethod: data.paymentMethod?.trim() || 'N/A',
              shippingName: data.shippingName?.trim() || 'N/A',
              price: order.price,
              shippingFee: order.shippingFee,
              discount: order.discount
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async updateOrder(order: OrderHistoryItem, changes: { name: string; quantity: number; paymentMethod: string; shippingName: string; price: number; shippingFee: number; discount: number }): Promise<void> {
    const updated = await this.cartService.updateOrder(order.id, changes);
    if (updated) {
      order.name = changes.name;
      order.quantity = changes.quantity;
      order.grandTotal = changes.price * changes.quantity + changes.shippingFee - changes.discount;
      order.paymentMethod = changes.paymentMethod;
      order.shippingName = changes.shippingName;
      this.orderHistory = [...this.orderHistory];
    } else {
      this.historyError = 'Hindi ma-update ang order. I-check ang Firestore Rules.';
    }
  }

  async editDashboardData(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Edit profile',
      inputs: [{ name: 'userName', type: 'text', label: 'Name', value: this.userName }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data: { userName: string }) => {
            const name = data.userName?.trim();
            if (!name) return false;
            this.userName = name;
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  goToOrders(): void {
    void this.loadOrderHistory();
    document.querySelector('.history-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async showPaymentMethods(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Payment methods',
      message: 'Cash on Delivery, GCash, at Card ay available sa checkout.',
      buttons: ['OK']
    });
    await alert.present();
  }

  // Function para i-update ang subscription days
  updateSubscription() {
    const days = prompt('Ilang araw ang gusto mong idagdag/itakda?', String(this.subDays));
    if (days && !isNaN(Number(days))) {
      this.subDays = Number(days);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  selectSection(section: string): void {
    this.activeSection = section;
    this.dashboardMessage = `${section} is selected.`;
  }

  refreshDashboard(): void {
    this.lastUpdate = new Date().toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    this.dashboardMessage = 'Dashboard data refreshed.';
  }

  showDetails(section: string): void {
    this.selectSection(section);
    this.dashboardMessage = `Showing details for ${section}.`;
  }

  goToShop(): void {
    this.navCtrl.navigateBack('/tabs/tab1');
  }
}
