import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { ThemeProvider } from '../src/contexts/ThemeContext.jsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const templatePath = path.join(distDir, 'index.html');

const routes = [
  { url: '/', outFile: 'index.html', importPath: '../src/pages/landing/LandingPage.jsx' },
  { url: '/pricing', outFile: 'pricing/index.html', importPath: '../src/pages/landing/Pricing.jsx' },
  { url: '/waitlist', outFile: 'waitlist/index.html', importPath: '../src/pages/landing/Waitlist.jsx' },
];

globalThis.window = undefined;

async function run() {
  const template = fs.readFileSync(templatePath, 'utf-8');

  for (const route of routes) {
    try {
      const absPath = path.resolve(__dirname, route.importPath);
      const fileUrl = pathToFileURL(absPath).href;
      const mod = await import(fileUrl);
      const PageComponent = mod.default;

      const app = React.createElement(
        StaticRouter,
        { location: route.url },
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(PageComponent)
        )
      );

      const bodyHtml = ReactDOMServer.renderToString(app);

      const finalHtml = template.replace(
        '<div id="root"></div>',
        `<div id="root">${bodyHtml}</div>`
      );

      const outPath = path.join(distDir, route.outFile);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, finalHtml);
      console.log(`Prerendered ${route.url} -> ${route.outFile}`);
    } catch (err) {
      console.error(`Prerender failed for ${route.url}:`, err.message);
    }
  }
}

await run();
process.exit(0);