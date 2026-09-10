import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://iihinseiri.com',
  outDir: './dist',
  // 既存URL（/articles/akutoku.html 形式）を維持する
  build: { format: 'file' }
});
