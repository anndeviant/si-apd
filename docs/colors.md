# Color Palette - SI-APD

## Blue Color Palette

Dokumentasi ini berisi template warna biru yang dapat digunakan dalam proyek SI-APD. Warna-warna ini mengikuti standar shade dari 50 (paling terang) hingga 950 (paling gelap).

### Color Values

| Shade    |oklch| Hex Code  | HSL                   | RGB                  | Tailwind Class |
| -------- | --------- | --------------------- | -------------------- | -------------- |
| blue-50  oklch(0.97 0.01 255)| `#eff6ff` | `hsl(214, 100%, 97%)` | `rgb(239, 246, 255)` | `bg-blue-50`   |
| blue-100 oklch(0.93 0.03 256)| `#dbeafe` | `hsl(214, 95%, 93%)`  | `rgb(219, 234, 254)` | `bg-blue-100`  |
| blue-200 oklch(0.88 0.06 254)| `#bfdbfe` | `hsl(214, 95%, 87%)`  | `rgb(191, 219, 254)` | `bg-blue-200`  |
| blue-300 oklch(0.81 0.10 252)| `#93c5fd` | `hsl(213, 94%, 78%)`  | `rgb(147, 197, 253)` | `bg-blue-300`  |
| blue-400 oklch(0.71 0.14 255)| `#60a5fa` | `hsl(213, 93%, 68%)`  | `rgb(96, 165, 250)`  | `bg-blue-400`  |
| blue-500 oklch(0.62 0.19 260)| `#3b82f6` | `hsl(217, 91%, 60%)`  | `rgb(59, 130, 246)`  | `bg-blue-500`  |
| blue-600 oklch(0.55 0.22 263)| `#2563eb` | `hsl(221, 83%, 53%)`  | `rgb(37, 99, 235)`   | `bg-blue-600`  |
| blue-700 oklch(0.49 0.22 264)| `#1d4ed8` | `hsl(224, 76%, 48%)`  | `rgb(29, 78, 216)`   | `bg-blue-700`  |
| blue-800 oklch(0.42 0.18 266)| `#1e40af` | `hsl(226, 71%, 40%)`  | `rgb(30, 64, 175)`   | `bg-blue-800`  |
| blue-900 oklch(0.38 0.14 266)| `#1e3a8a` | `hsl(228, 63%, 33%)`  | `rgb(30, 58, 138)`   | `bg-blue-900`  |
| blue-950 oklch(0.28 0.09 268)| `#172554` | `hsl(229, 84%, 20%)`  | `rgb(23, 37, 84)`    | `bg-blue-950`  |



## Contoh Penggunaan

### Background Colors

```html
<!-- Light backgrounds -->
<div class="bg-blue-50">Very light blue background</div>
<div class="bg-blue-100">Light blue background</div>
<div class="bg-blue-200">Lighter blue background</div>

<!-- Medium backgrounds -->
<div class="bg-blue-400">Medium blue background</div>
<div class="bg-blue-500">Primary blue background</div>
<div class="bg-blue-600">Darker blue background</div>

<!-- Dark backgrounds -->
<div class="bg-blue-800">Dark blue background</div>
<div class="bg-blue-900">Very dark blue background</div>
<div class="bg-blue-950">Darkest blue background</div>
```

### Text Colors

```html
<!-- Light text (untuk dark backgrounds) -->
<p class="text-blue-50">Very light blue text</p>
<p class="text-blue-100">Light blue text</p>

<!-- Medium text -->
<p class="text-blue-500">Primary blue text</p>
<p class="text-blue-600">Darker blue text</p>

<!-- Dark text (untuk light backgrounds) -->
<p class="text-blue-800">Dark blue text</p>
<p class="text-blue-900">Very dark blue text</p>
```

### Border Colors

```html
<div class="border border-blue-200">Light blue border</div>
<div class="border border-blue-500">Primary blue border</div>
<div class="border border-blue-700">Dark blue border</div>
```

### Button Examples

```html
<!-- Primary Button -->
<button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Primary Button
</button>

<!-- Secondary Button -->
<button class="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded">
  Secondary Button
</button>

<!-- Outline Button -->
<button
  class="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded"
>
  Outline Button
</button>
```

## Rekomendasi Penggunaan

### Primary Colors (Warna Utama)

- **blue-600**: Untuk elemen utama seperti primary buttons, links
- **blue-700**: Untuk hover states pada primary elements
- **blue-500**: Untuk accent colors dan highlights

### Secondary Colors (Warna Pendukung)

- **blue-100**: Untuk background sections yang ringan
- **blue-200**: Untuk borders dan dividers
- **blue-50**: Untuk subtle backgrounds

### Text Colors (Warna Teks)

- **blue-900**: Untuk headings pada light backgrounds
- **blue-700**: Untuk body text dengan emphasis
- **blue-600**: Untuk links dan interactive text

### Dark Theme

- **blue-950**: Untuk dark backgrounds
- **blue-800**: Untuk secondary dark backgrounds
- **blue-100**: Untuk text pada dark backgrounds

## CSS Custom Properties

Jika ingin menggunakan sebagai CSS variables, tambahkan ke `globals.css`:

```css
:root {
  --blue-50: #eff6ff;
  --blue-100: #dbeafe;
  --blue-200: #bfdbfe;
  --blue-300: #93c5fd;
  --blue-400: #60a5fa;
  --blue-500: #3b82f6;
  --blue-600: #2563eb;
  --blue-700: #1d4ed8;
  --blue-800: #1e40af;
  --blue-900: #1e3a8a;
  --blue-950: #172554;
}
```

## Konfigurasi Tailwind

Untuk memastikan warna ini tersedia di Tailwind CSS, tambahkan ke `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
    },
  },
};
```

---

**Catatan**: File ini dibuat sebagai referensi cepat untuk konsistensi warna dalam proyek SI-APD. Pastikan untuk menggunakan warna-warna ini secara konsisten di seluruh aplikasi.
