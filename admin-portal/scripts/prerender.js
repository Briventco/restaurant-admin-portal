import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const templatePath = path.join(distDir, 'index.html');

const routes = [
  { url: '/', outFile: 'index.html', Component: () => import('../src/pages/landing/LandingPage.jsx') },
  { url: '/pricing', outFile: 'pricing/index.html', Component: () => import('../src/pages/landing/Pricing.jsx') },
  { url: '/waitlist', outFile: 'waitlist/index.html', Component: () => import('../src/pages/landing/Waitlist.jsx') },
];

global.window = undefined;

async function run() {
  const template = fs.readFileSync(templatePath, 'utf-8');

  for (const route of routes) {
    const mod = await route.Component();
    const PageComponent = mod.default;

    const app = React.createElement(
      StaticRouter,
      { location: route.url },
      React.createElement(PageComponent)
    );

    let bodyHtml = '';
    try {
      bodyHtml = ReactDOMServer.renderToString(app);
    } catch (err) {
      console.error(`Prerender failed for ${route.url}:`, err.message);
      continue;
    }

    const finalHtml = template.replace(
      '<div id="root"></div>',
      `<div id="root">${bodyHtml}</div>`
    );

    const outPath = path.join(distDir, route.outFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, finalHtml);
    console.log(`Prerendered ${route.url} -> ${route.outFile}`);
  }
}

run();