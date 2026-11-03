import { Injectable, signal } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  getDocs,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

export interface CartItem {
  name: string;
  price: number;
  style: string;
  color: string;
  imageUrl: string;
  size?: string;
  quantity: number;
}

export type AddCartItemInput = Omit<CartItem, 'quantity'>;

export interface CheckoutDetails {
  address: {
    fullName: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
  };
  shippingName: string;
  shippingFee: number;
  paymentMethod: string;
  voucherCode: string;
  discount: number;
}

export interface OrderHistoryItem {
  id: string;
  orderId: string;
  name: string;
  price: number;
  quantity: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  shippingName: string;
  paidAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Ligtas na pag-initialize ng Firebase
  app = getApps().length === 0 ? initializeApp(environment.firebaseConfig) : getApp();
  db = getFirestore(this.app);
  lastPaymentError = '';

  // Signal para sa cart state management
  private cartItemsSignal = signal<CartItem[]>([]);
  private favoriteNamesSignal = signal<string[]>([]);
  private homeTabVersionSignal = signal(0);

  // Read-only getter para sa component templates
  get cartItems() {
    return this.cartItemsSignal();
  }

  get favoriteNames(): string[] {
    return this.favoriteNamesSignal();
  }

  get homeTabVersion(): number {
    return this.homeTabVersionSignal();
  }

  activateHomeTab(): void {
    this.homeTabVersionSignal.update((version) => version + 1);
  }

  isFavorite(name: string): boolean {
    return this.favoriteNamesSignal().includes(name);
  }

  toggleFavorite(name: string): void {
    const currentNames = this.favoriteNamesSignal();
    this.favoriteNamesSignal.set(currentNames.includes(name)
      ? currentNames.filter((favoriteName) => favoriteName !== name)
      : [...currentNames, name]);
  }

  // 1. Kapag nag-add sa cart (Hindi pa ise-save sa Firebase hangga't hindi nag-Pay Now)
  addToCart(product: AddCartItemInput): void {
    const currentItems = this.cartItemsSignal();
    const existingIndex = currentItems.findIndex(item =>
      item.name === product.name && item.color === product.color && item.size === product.size
    );

    if (existingIndex > -1) {
      const updated = [...currentItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1
      };
      this.cartItemsSignal.set(updated);
    } else {
      this.cartItemsSignal.set([
        ...currentItems,
        { ...product, quantity: 1 }
      ]);
    }
    console.log("Idinagdag sa cart state.", this.cartItemsSignal());
  }

  // 2. KAPAG PININDOT ANG PAY NOW: Dito pa lamang ise-save sa Firebase Firestore
  async processPayment(details: CheckoutDetails): Promise<boolean> {
    this.lastPaymentError = '';
    const itemsToCheckout = this.cartItemsSignal();

    if (itemsToCheckout.length === 0) {
      console.warn("Walang laman ang cart para i-checkout.");
      return false;
    }

    try {
      const subtotal = this.getTotalPrice();
      const total = subtotal + details.shippingFee - details.discount;
      const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const ordersCollection = collection(this.db, 'Rental Dress');
      const batch = writeBatch(this.db);

      for (const item of itemsToCheckout) {
        const orderDocument = doc(ordersCollection);
        batch.set(orderDocument, {
          orderId,
          name: String(item.name),
          price: Number(item.price),
          style: String(item.style),
          color: String(item.color),
          size: String(item.size ?? 'M'),
          imageUrl: String(item.imageUrl || ''),
          quantity: Number(item.quantity),
          totalItemPrice: Number(item.price * item.quantity),
          subtotal,
          shippingName: details.shippingName,
          shippingFee: details.shippingFee,
          paymentMethod: details.paymentMethod,
          voucherCode: details.voucherCode,
          discount: details.discount,
          grandTotal: total,
          address: details.address,
          paidAt: serverTimestamp()
        });
      }

      await batch.commit();
      console.log('Matagumpay na nai-save sa Firebase. Order ID:', orderId);

      this.clearCart();
      return true;

    } catch (e) {
      const error = e as { code?: string; message?: string };
      this.lastPaymentError = error.code ?? 'unknown';
      console.error('Firestore save failed:', error.code ?? 'unknown', error.message ?? e);
      return false;
    }
  }

  async getOrderHistory(): Promise<OrderHistoryItem[]> {
    const snapshot = await getDocs(collection(this.db, 'Rental Dress'));

    return snapshot.docs
      .map((orderDocument) => {
        const data = orderDocument.data();
        const paidAt = data['paidAt'];
        const paidAtDate = paidAt?.toDate?.() as Date | undefined;

        return {
          id: orderDocument.id,
          orderId: String(data['orderId'] ?? ''),
          name: String(data['name'] ?? 'Unnamed item'),
          price: Number(data['price'] ?? 0),
          quantity: Number(data['quantity'] ?? 0),
          shippingFee: Number(data['shippingFee'] ?? 0),
          discount: Number(data['discount'] ?? 0),
          grandTotal: Number(data['grandTotal'] ?? 0),
          paymentMethod: String(data['paymentMethod'] ?? 'N/A'),
          shippingName: String(data['shippingName'] ?? 'N/A'),
          paidAt: paidAtDate ? paidAtDate.toLocaleString() : 'Pending timestamp'
        };
      })
      .sort((first, second) => second.paidAt.localeCompare(first.paidAt));
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(this.db, 'Rental Dress', orderId));
      return true;
    } catch (e) {
      const error = e as { code?: string; message?: string };
      console.error('Firestore delete failed:', error.code ?? 'unknown', error.message ?? e);
      return false;
    }
  }

  async updateOrder(
    orderId: string,
    changes: { name: string; quantity: number; paymentMethod: string; shippingName: string; price: number; shippingFee: number; discount: number }
  ): Promise<boolean> {
    try {
      await updateDoc(doc(this.db, 'Rental Dress', orderId), {
        name: changes.name,
        quantity: changes.quantity,
        totalItemPrice: changes.price * changes.quantity,
        grandTotal: changes.price * changes.quantity + changes.shippingFee - changes.discount,
        paymentMethod: changes.paymentMethod,
        shippingName: changes.shippingName,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      const error = e as { code?: string; message?: string };
      console.error('Firestore update failed:', error.code ?? 'unknown', error.message ?? e);
      return false;
    }
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSignal();
  }

  getCartCount(): number {
    return this.cartItemsSignal().reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cartItemsSignal().reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  increaseQuantity(index: number): void {
    const current = [...this.cartItemsSignal()];
    if (current[index]) {
      current[index].quantity++;
      this.cartItemsSignal.set(current);
    }
  }

  decreaseQuantity(index: number): void {
    const current = [...this.cartItemsSignal()];
    if (current[index]) {
      if (current[index].quantity > 1) {
        current[index].quantity--;
        this.cartItemsSignal.set(current);
      } else {
        this.removeFromCart(index);
      }
    }
  }

  removeFromCart(index: number): void {
    const current = this.cartItemsSignal();
    if (index >= 0 && index < current.length) {
      const updated = current.filter((_, i) => i !== index);
      this.cartItemsSignal.set(updated);
    }
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
  }
}
