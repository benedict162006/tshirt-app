import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonIcon, IonList, IonItem, IonThumbnail,
  IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonInput, IonSelect, IonSelectOption
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  cardOutline,
  carOutline,
  cartOutline,
  chevronBackOutline,
  chevronDownOutline,
  locationOutline,
  removeOutline,
  shirtOutline,
  ticketOutline,
  trashOutline
} from 'ionicons/icons';
import { CartService, CartItem, CheckoutDetails } from '../services/cart.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['cart.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonList, IonItem, IonThumbnail,
    IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonInput, IonSelect, IonSelectOption
  ]
})
export class Tab2Page {

  isCheckingOut = false;
  public cartService = inject(CartService);
  private alertCtrl = inject(AlertController);
  private navCtrl = inject(NavController);

  constructor() {
    addIcons({
      addOutline,
      cardOutline,
      carOutline,
      cartOutline,
      chevronBackOutline,
      chevronDownOutline,
      locationOutline,
      removeOutline,
      shirtOutline,
      ticketOutline,
      trashOutline
    });
  }

  // Kukuha ng pinakabaging listahan ng items mula sa CartService
  hasAddress = false;
  fullName = '';
  phoneNumber = '';
  streetAddress = '';
  city = '';
  selectedShippingName = '';
  selectedShippingFee = 0;
  selectedPaymentMethod = '';
  voucherCode = '';
  voucherDiscount = 0;
  freeShippingVoucherApplied = false;

  get cartItems(): CartItem[] {
    return this.cartService.getCartItems();
  }

  increaseQty(index: number): void {
    this.cartService.increaseQuantity(index);
  }

  decreaseQty(index: number): void {
    this.cartService.decreaseQuantity(index);
  }

  removeItem(index: number): void {
    this.cartService.removeFromCart(index);
  }

  goToCheckout(): void {
    if (this.cartItems.length > 0) {
      this.isCheckingOut = true;
    }
  }

  goToShop(): void {
    this.navCtrl.navigateBack('/tabs/tab1');
  }

  addOrUpdateAddress(): void {
    if (!this.fullName.trim() || !this.phoneNumber.trim() || !this.streetAddress.trim() || !this.city.trim()) {
      void this.presentMessage('Incomplete address', 'Punan ang lahat ng address fields.');
      return;
    }
    this.hasAddress = true;
  }

  updateShippingFee(): void {
    if (this.selectedShippingName === 'Express') {
      this.selectedShippingFee = 100;
    } else if (this.selectedShippingName === 'Standard') {
      this.selectedShippingName = 'Standard';
      this.selectedShippingFee = 50;
    } else {
      this.selectedShippingFee = 0;
    }
  }

  applyVoucher(): void {
    const normalizedCode = this.voucherCode.trim().toUpperCase();
    if (normalizedCode === 'SAVE10') {
      this.voucherCode = normalizedCode;
      this.voucherDiscount = this.cartService.getTotalPrice() * 0.1;
      this.freeShippingVoucherApplied = false;
      return;
    }

    if (normalizedCode === 'FREESHIP') {
      this.voucherCode = normalizedCode;
      this.voucherDiscount = 0;
      this.freeShippingVoucherApplied = true;
      return;
    }

    if (normalizedCode === '') {
      this.voucherCode = '';
      this.voucherDiscount = 0;
      this.freeShippingVoucherApplied = false;
      return;
    }

    this.voucherCode = '';
    this.voucherDiscount = 0;
    this.freeShippingVoucherApplied = false;
    void this.presentMessage('Voucher', 'Hindi valid ang voucher code.');
  }

  getVoucherSavings(): number {
    return this.voucherDiscount + (this.freeShippingVoucherApplied ? this.selectedShippingFee : 0);
  }

  getGrandTotal(): number {
    return this.cartService.getTotalPrice() + this.selectedShippingFee - this.getVoucherSavings();
  }

  payNow(): void {
    void this.checkout();
  }

  async clearCart(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Kumpirmasyon',
      message: 'Sigurado ka bang nais mong linisin ang iyong cart?',
      buttons: [
        { text: 'Kanselahin', role: 'cancel' },
        {
          text: 'Linisin',
          role: 'destructive',
          handler: () => this.cartService.clearCart()
        }
      ]
    });
    await alert.present();
  }

  async checkout(): Promise<void> {
    if (!this.hasAddress || !this.selectedShippingName || !this.selectedPaymentMethod) {
      await this.presentMessage(
        'Complete checkout details',
        'Maglagay ng address, shipping option, at payment method bago magbayad.'
      );
      return;
    }

    const details: CheckoutDetails = {
      address: {
        fullName: this.fullName,
        phoneNumber: this.phoneNumber,
        streetAddress: this.streetAddress,
        city: this.city
      },
      shippingName: this.selectedShippingName,
      shippingFee: this.selectedShippingFee,
      paymentMethod: this.selectedPaymentMethod,
      voucherCode: this.voucherCode,
      discount: this.getVoucherSavings()
    };
    const total = this.getGrandTotal();
    const saved = await this.cartService.processPayment(details);

    if (!saved) {
      const errorAlert = await this.alertCtrl.create({
        header: 'Payment Failed',
        message: this.cartService.lastPaymentError === 'permission-denied'
          ? 'Walang permission ang app na magsulat sa Firestore. I-update ang Firestore Rules para payagan ang order writes.'
          : `Hindi naisave ang order (${this.cartService.lastPaymentError || 'unknown error'}). Pakisubukan muli.`,
        buttons: ['OK']
      });
      await errorAlert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Order Placed!',
      message: `Maraming salamat! Ang kabuuang halaga ng iyong order ay ₱${total}.`,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.cartService.clearCart();
            this.navCtrl.navigateRoot('/tabs/tab1');
          }
        }
      ]
    });
    await alert.present();
  }

  private async presentMessage(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}
