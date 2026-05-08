import { faCommentDots, faListUl, faTruck, faMobileAlt, faBolt, faCheckCircle, faShieldAlt, faHeadset } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
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
];

export const stepsData = [
  { icon: faWhatsapp, number: '01', title: 'Open WhatsApp', description: 'Click the button and it opens your WhatsApp app automatically — no download needed.' },
  { icon: faCommentDots, number: '02', title: 'Send a message', description: 'Say "Hi" or "Menu" and Servra responds to you instantly.' },
  { icon: faListUl, number: '03', title: 'Choose your food', description: 'Browse the menu right inside the chat and reply with what you want to order.' },
  { icon: faTruck, number: '04', title: 'Get it delivered', description: 'Confirm your address and receive real-time delivery updates directly in your chat.' },
];

export const featuresList = [
  { icon: faMobileAlt, title: 'No app download', description: 'Works directly inside WhatsApp. Nothing extra to install on your phone.' },
  { icon: faBolt, title: 'Instant ordering', description: 'Place a complete order in under 60 seconds through simple chat replies.' },
  { icon: faCheckCircle, title: 'Fast confirmation', description: 'Get your order confirmed by the restaurant immediately after you send it.' },
  { icon: faShieldAlt, title: 'Real-time updates', description: 'Every delivery status update is sent straight to your WhatsApp chat.' },
  { icon: faWhatsapp, title: '100% WhatsApp-based', description: 'The entire ordering experience lives inside the app you already use every day.' },
  { icon: faHeadset, title: 'Works on any phone', description: 'No smartphone requirements. If you have WhatsApp, you can use Servra.' },
];

export const statsData = [
  { value: '100%', label: 'WhatsApp based' },
  { value: '0', label: 'App downloads' },
  { value: '60s', label: 'To place an order' },
];