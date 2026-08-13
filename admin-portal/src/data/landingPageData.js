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
  { id: 'faq', label: 'FAQ' },
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

export const marqueeItems = [
  'WhatsApp Ordering',
  'Zero Missed Orders',
  'Automated Replies',
  '24/7 Sales',
  'Menu Management',
  'Instant Notifications',
  'No Extra Apps',
  'Restaurant Automation',
  'Delivery Tracking',
  'Nigerian Restaurants',
];

export const faqData = [
  {
    question: 'How does Servra work?',
    answer: 'Servra connects to your WhatsApp Business number and handles customer orders automatically. Customers message you, browse your menu, place orders, and get confirmations — all without you touching your phone.',
  },
  {
    question: 'Do my customers need to download anything?',
    answer: 'No. Your customers already have WhatsApp. They just message your number as normal and Servra handles everything from there.',
  },
  {
    question: 'How long does setup take?',
    answer: 'Under 2 minutes. You connect your WhatsApp number, upload your menu, and you are ready to start receiving automated orders.',
  },
  {
    question: 'What happens if I go above my order limit?',
    answer: 'Orders above your monthly limit are charged at ₦10 per order. You will never lose a sale — Servra keeps taking orders and you pay for what you use.',
  },
  {
    question: 'Can I manage multiple locations?',
    answer: 'Yes, the Pro plan supports multi-location management from a single dashboard.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Servra is free during early access for everyone on the waitlist. Join now to lock in your spot before paid plans launch.',
  },
];