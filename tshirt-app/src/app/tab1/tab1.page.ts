import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonContent,
  IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  cartOutline,
  chevronBackOutline,
  chevronDownOutline,
  chevronUpOutline,
  closeCircleOutline,
  arrowForwardOutline,
  heart,
  heartOutline,
  pricetagOutline,
  playOutline,
  reorderThreeOutline,
  searchOutline,
  shareSocialOutline,
  shirtOutline,
  sparklesOutline,
  trophyOutline
} from 'ionicons/icons';
import { register } from 'swiper/element/bundle';
import { CartService, CartItem } from '../services/cart.service';

interface ShirtColor {
  name: string;
  hex: string;
}

interface ShirtProduct {
  name: string;
  price: number;
  style: string;
  color: string;
  photoColor?: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  description: string;
  colors: ShirtColor[];
}

register();

@Component({
  selector: 'app-tab1',
  templateUrl: 'storefront.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, FormsModule, IonContent, IonIcon
  ]
})
export class Tab1Page {

  searchQuery: string = '';
  currentView = inject(ActivatedRoute).snapshot.data['view'] ?? 'home';
  activeCategory = '';
  selectedProduct = signal<ShirtProduct | null>(null);
  selectedSize = 'M';
  isReviewsOpen = false;
  cartNotice = '';
  liveNotice = '';
  sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  categories = [
    { name: 'Graphic', label: 'New', icon: 'sparkles-outline' },
    { name: 'Streetwear', label: 'Best Sellers', icon: 'trophy-outline' },
    { name: 'Classic', label: 'Kategorya', icon: 'reorder-three-outline' },
    { name: 'Sale', label: 'Sale', icon: 'pricetag-outline' }
  ];

  tshirtList: ShirtProduct[] = [
    {
      name: 'Bayanihan Squad',
      price: 699,
      style: 'Graphic',
      color: 'White',
      photoColor: 'Black',
      imageUrl: 'https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=760&q=85',
      rating: 4.8,
      reviewCount: 112,
      description: 'Premium cotton, brightening and cotton combed fabric na tumatagal. Comfortable sa araw-araw.',
      colors: [{ name: 'White', hex: '#f7f7f5' }, { name: 'Black', hex: '#111827' }, { name: 'Navy', hex: '#0755a5' }, { name: 'Red', hex: '#d5222a' }]
    },
    {
      name: 'MNL Street Art',
      price: 750,
      style: 'Streetwear',
      color: 'Black',
      photoColor: 'Black',
      imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=760&q=85',
      rating: 4.8,
      reviewCount: 86,
      description: 'Isang bold na streetwear graphic sa malambot at preskong cotton tee.',
      colors: [{ name: 'Black', hex: '#111827' }, { name: 'White', hex: '#f7f7f5' }, { name: 'Navy', hex: '#0755a5' }]
    },
    {
      name: 'Isda at Pangarap',
      price: 649,
      style: 'Classic',
      color: 'Navy',
      photoColor: 'White',
      imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=760&q=85',
      rating: 4.9,
      reviewCount: 74,
      description: 'Araw-araw na paborito na may makulay na local-inspired print at relaxed fit.',
      colors: [{ name: 'Navy', hex: '#0755a5' }, { name: 'White', hex: '#f7f7f5' }, { name: 'Black', hex: '#111827' }]
    },
    {
      name: 'Alamat Graffiti',
      price: 720,
      style: 'Graphic',
      color: 'Red',
      photoColor: 'White',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=760&q=85',
      rating: 4.7,
      reviewCount: 58,
      description: 'Statement print na inspired ng alamat, gawa sa breathable premium cotton.',
      colors: [{ name: 'Red', hex: '#d5222a' }, { name: 'Black', hex: '#111827' }, { name: 'White', hex: '#f7f7f5' }]
    },
    {
      name: 'Minimalist Graphic Tee',
      price: 250,
      style: 'Graphic',
      color: 'Black',
      imageUrl: 'https://images.weserv.nl/?url=https://i.pinimg.com/originals/94/2e/da/942eda5ce231f70d2597fdaec5390fdd.jpg&w=200',
      rating: 0,
      reviewCount: 0,
      description: 'Simple at malinis na graphic tee para sa pang-araw-araw na outfit.',
      colors: [{ name: 'Black', hex: '#111827' }, { name: 'White', hex: '#f7f7f5' }, { name: 'Gray', hex: '#7b818a' }]
    },
    {
      name: 'Vintage Oversized Shirt',
      price: 350,
      style: 'Vintage',
      color: 'White',
      imageUrl: 'https://images.weserv.nl/?url=https://th.bing.com/th/id/OIP.z6uqsv7Oh1Lw3B9so5aJWQHaHa?w=208&h=208&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3&w=200',
      rating: 0,
      reviewCount: 0,
      description: 'Relaxed oversized fit na may vintage-inspired na dating.',
      colors: [{ name: 'White', hex: '#f7f7f5' }, { name: 'Black', hex: '#111827' }, { name: 'Beige', hex: '#d8c2a2' }]
    },
    {
      name: 'Casual Corporate Polo',
      price: 400,
      style: 'Polo Shirt',
      color: 'Navy Blue',
      imageUrl: 'https://images.weserv.nl/?url=https://th.bing.com/th?q=Red+Shirt+Friday+Corporate+Polo&w=120&h=120&c=1&rs=1&qlt=70&r=0&o=7&cb=1&dpr=1.3&pid=InlineBlock&rm=3&mkt=en-PH&cc=PH&setlang=en&adlt=moderate&t=1&mw=247&w=200',
      rating: 0,
      reviewCount: 0,
      description: 'Komportableng polo shirt na bagay sa casual at work outfits.',
      colors: [{ name: 'Navy Blue', hex: '#0755a5' }, { name: 'White', hex: '#f7f7f5' }, { name: 'Red', hex: '#d5222a' }]
    },
    {
      name: 'Athletic Tank Top',
      price: 200,
      style: 'Tank Top',
      color: 'Gray',
      imageUrl: 'https://images.weserv.nl/?url=https://th.bing.com/th/id/OIP.YnVrKgOxrg30CkwH9OUk5QHaHa?w=208&h=208&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3&w=200',
      rating: 0,
      reviewCount: 0,
      description: 'Magaan at preskong tank top para sa workout at mainit na panahon.',
      colors: [{ name: 'Gray', hex: '#7b818a' }, { name: 'Black', hex: '#111827' }, { name: 'White', hex: '#f7f7f5' }]
    },
    {
      name: 'Classic Baseball Tee',
      price: 310,
      style: 'Baseball Tee',
      color: 'White/Red',
      imageUrl: 'https://images.weserv.nl/?url=https://th.bing.com/th/id/OIP.PMT0P0b4fC3p9xXXH13RygHaGy?w=222&h=203&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3&w=200',
      rating: 0,
      reviewCount: 0,
      description: 'Classic raglan-style tee na may sporty na contrast sleeves.',
      colors: [{ name: 'White/Red', hex: '#d5222a' }, { name: 'White/Navy', hex: '#0755a5' }]
    },
    {
      name: 'Heavyweight Boxy Tee',
      price: 390,
      style: 'Heavyweight',
      color: 'Off White',
      imageUrl: 'https://images.weserv.nl/?url=https://th.bing.com/th/id/OIP.sTzsIfIoVcD0fYvTQhtM6QHaJ4?w=208&h=277&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3&w=200',
      rating: 0,
      reviewCount: 0,
      description: 'Makapal at structured na cotton shirt na may relaxed boxy fit.',
      colors: [{ name: 'Off White', hex: '#f1eee6' }, { name: 'Black', hex: '#111827' }]
    },
    {
      name: 'Retro Washed Vintage Tee',
      price: 360,
      style: 'Vintage',
      color: 'Faded Black',
      imageUrl: 'https://images.weserv.nl/?url=https://th.bing.com/th/id/OIP.kKNgU87XvbSo-tA6DkWUswHaJ0?w=208&h=275&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3&w=200',
      rating: 0,
      reviewCount: 0,
      description: 'Soft washed tee na may faded finish at classic vintage fit.',
      colors: [{ name: 'Faded Black', hex: '#41434a' }, { name: 'White', hex: '#f7f7f5' }]
    },
    {
      name: 'Streetwear Graphic Print',
      price: 330,
      style: 'Graphic',
      color: 'Green',
      imageUrl: 'https://images.weserv.nl/?url=https://th.bing.com/th/id/OIP.L8Ot5QFPGxSt5cuCduIYDQHaJ4?w=208&h=277&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3&w=200',
      rating: 0,
      reviewCount: 0,
      description: 'Graphic-print shirt para sa bold na streetwear look.',
      colors: [{ name: 'Green', hex: '#18734a' }, { name: 'Black', hex: '#111827' }, { name: 'White', hex: '#f7f7f5' }]
    },
    {
      name: 'Premium Tie-Dye Shirt',
      price: 370,
      style: 'Tie-Dye',
      color: 'Multi',
      imageUrl: 'https://images.weserv.nl/?url=https://i.pinimg.com/originals/94/2e/da/942eda5ce231f70d2597fdaec5390fdd.jpg&w=200',
      rating: 0,
      reviewCount: 0,
      description: 'Colorful tie-dye shirt na bawat piraso ay may sariling pattern.',
      colors: [{ name: 'Multi', hex: '#6b8fda' }, { name: 'Black', hex: '#111827' }]
    },
    {
      name: 'Ribbed Slim Fit Tee',
      price: 280,
      style: 'Slim Fit',
      color: 'Beige',
      imageUrl: 'https://images.weserv.nl/?url=https://th.bing.com/th/id/OIP.z6uqsv7Oh1Lw3B9so5aJWQHaHa?w=208&h=208&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3&w=200',
      rating: 0,
      reviewCount: 0,
      description: 'Ribbed slim-fit tee na madaling i-layer o isuot nang solo.',
      colors: [{ name: 'Beige', hex: '#d8c2a2' }, { name: 'Black', hex: '#111827' }, { name: 'White', hex: '#f7f7f5' }]
    }
  ];

  public cartService = inject(CartService);
  private navCtrl = inject(NavController);

  constructor() {
    addIcons({
      addOutline,
      arrowForwardOutline,
      cartOutline,
      chevronBackOutline,
      chevronDownOutline,
      chevronUpOutline,
      closeCircleOutline,
      heart,
      heartOutline,
      pricetagOutline,
      playOutline,
      reorderThreeOutline,
      searchOutline,
      shareSocialOutline,
      shirtOutline,
      sparklesOutline,
      trophyOutline
    });
    effect(() => {
      if (this.cartService.homeTabVersion > 0) this.selectedProduct.set(null);
    });
  }

  ionViewWillEnter(): void {
    this.selectedProduct.set(null);
  }

  selectProduct(shirt: ShirtProduct): void {
    this.selectedProduct.set(shirt);
    this.isReviewsOpen = false;
  }

  backToProducts(): void {
    this.selectedProduct.set(null);
  }

  getDefaultProductColor(product: ShirtProduct): string {
    const productColor = (product.photoColor ?? product.color).toLowerCase();
    const colorMatch = product.colors.find((color) =>
      color.name.toLowerCase() === productColor ||
      (color.name.toLowerCase().includes('navy') && productColor.includes('navy')) ||
      (color.name.toLowerCase().includes('white') && productColor.includes('white'))
    );

    return colorMatch?.hex ?? product.colors[0]?.hex ?? '#f7f7f5';
  }

  getColorBlendMode(product: ShirtProduct): string {
    const productColor = (product.photoColor ?? product.color).toLowerCase();
    return productColor.includes('black') ? 'screen' : 'multiply';
  }

  toggleProductFavorite(shirt: ShirtProduct): void {
    this.cartService.toggleFavorite(shirt.name);
  }

  isFavorite(shirt: ShirtProduct): boolean {
    return this.cartService.isFavorite(shirt.name);
  }

  toggleReviews(): void {
    this.isReviewsOpen = !this.isReviewsOpen;
  }

  openLiveShow(): void {
    this.liveNotice = 'Walang active live stream. Ikonekta ang YouTube Live o Facebook Live URL.';
  }

  async shareProduct(shirt: ShirtProduct): Promise<void> {
    const shareData = { title: shirt.name, text: `${shirt.name} - ₱${shirt.price}`, url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(`${shareData.text} ${shareData.url}`);
    window.alert('Na-copy ang product link.');
  }

  get categoryFilters(): string[] {
    return [...new Set(this.tshirtList.map((shirt) => shirt.style)), 'Sale'];
  }

  filterByCategory(categoryName: string) {
    this.activeCategory = categoryName === 'All' ? '' : categoryName;
  }

  clearSearch() {
    this.searchQuery = '';
  }

  get filteredTshirtList() {
    let products = this.currentView === 'wishlist'
      ? this.tshirtList.filter((shirt) => this.cartService.isFavorite(shirt.name))
      : this.tshirtList;
    if (this.activeCategory === 'Sale') {
      products = products.filter((shirt) => shirt.price < 700);
    } else if (this.activeCategory) {
      products = products.filter((shirt) => shirt.style.toLowerCase() === this.activeCategory.toLowerCase());
    }
    if (!this.searchQuery.trim()) return products;
    const query = this.searchQuery.toLowerCase().trim();
    return products.filter(shirt =>
      shirt.name.toLowerCase().includes(query) ||
      shirt.style.toLowerCase().includes(query) ||
      shirt.color.toLowerCase().includes(query)
    );
  }

  // Add the item and let the cart page handle checkout and payment.
  onOrderNow(shirt: Omit<CartItem, 'quantity'>) {
    this.addToCart(shirt);
    this.navCtrl.navigateForward('/tabs/tab2');
  }

  addToCart(shirt: Omit<CartItem, 'quantity'>) {
    const isSelectedProduct = this.selectedProduct()?.name === shirt.name;
    const size = isSelectedProduct ? this.selectedSize : 'M';
    const color = shirt.color;
    this.cartService.addToCart({ ...shirt, size, color });
    this.cartNotice = `${shirt.name} naidagdag sa cart.`;
  }

  goToCart() {
    this.navCtrl.navigateForward('/tabs/tab2');
  }

  goToHome(): void {
    this.navCtrl.navigateBack('/tabs/tab1');
  }
}
