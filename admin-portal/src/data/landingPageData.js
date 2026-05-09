import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import {
  faCommentDots, faListUl, faTruck,
  faMobileAlt, faBolt, faCheckCircle, faShieldAlt, faHeadset
} from '@fortawesome/free-solid-svg-icons';

export const WHATSAPP_NUMBER = '2349133867929';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi!%20I%20want%20to%20order%20food`;

export const menuItems = {
  '1': { name: 'Jollof Rice', price: 2500 },
  '2': { name: 'Grilled Chicken', price: 3500 },
  '3': { name: 'Beef Burger', price: 2000 }
};

export const menuText = `🍛 1. Jollof Rice — ₦2,500\n🍗 2. Grilled Chicken — ₦3,500\n🍔 3. Beef Burger — ₦2,000\n\nReply with item number (1, 2, or 3) to order.`;

export const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'pricing', label: 'Pricing' },
];

export const stepsData = [
  { icon: faWhatsapp, number: '01', title: 'Connect WhatsApp', description: 'Link your business WhatsApp number to Servra in under 2 minutes. No technical skills needed.' },
  { icon: faCommentDots, number: '02', title: 'Set Your Menu', description: 'Upload your menu, set prices, and customize auto-reply messages for your customers.' },
  { icon: faListUl, number: '03', title: 'Customers Order', description: 'Customers message your number, browse the menu, and place orders — all automated.' },
  { icon: faTruck, number: '04', title: 'You Get Paid', description: 'Receive order notifications, confirm deliveries, and track sales from your dashboard.' },
];

export const featuresList = [
  { icon: faMobileAlt, title: 'Auto-reply to every customer', description: 'Instantly respond to orders even when you are busy cooking or away from your phone.' },
  { icon: faBolt, title: 'Orders confirmed automatically', description: 'Customers receive instant order confirmations with price and delivery details.' },
  { icon: faCheckCircle, title: 'Live order notifications', description: 'Get notified the moment an order comes in so you never miss a sale.' },
  { icon: faShieldAlt, title: 'Works 24/7', description: 'Your WhatsApp takes orders around the clock — even while you sleep.' },
  { icon: faWhatsapp, title: 'No extra apps needed', description: 'Your customers already have WhatsApp. No downloads, no signups, no friction.' },
  { icon: faHeadset, title: 'Dashboard for your team', description: 'Manage your menu, track orders, and view analytics from one simple dashboard.' },
];

export const statsData = [
  { value: '24/7', label: 'Automated Orders' },
  { value: '0', label: 'Missed Sales' },
  { value: '1', label: 'Platform — WhatsApp' },
];