# PikcelGrid 🎨

A beautiful, interactive web application that transforms images into pixelated grids with customizable color quantization and advanced image manipulation features.

![PikcelGrid](https://img.shields.io/badge/Status-Live-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Platform](https://img.shields.io/badge/Platform-Web-lightgrey)

## ✨ Features

### Core Functionality
- **Image Upload**: Support for JPG, PNG, and WebP formats
- **Pixel Grid Generation**: Convert images into customizable pixel grids
- **Aspect Ratio Preservation**: Automatically maintains original image proportions
- **Row & Column Labels**: Numbered labels for easy grid reference
- **Color Quantization**: Limit colors using a threshold-based algorithm (2-50 colors)
- **Grid Size Control**: Adjustable grid resolution (5-100 columns)

### Advanced Controls
- **Zoom**: Scale images from 50% to 200% with center crop
- **Offset X/Y**: Pan images horizontally and vertically (-50% to +50%)
- **Grid Lines Toggle**: Show/hide grid cell borders
- **Live Preview**: Real-time updates as you adjust settings

### Export & Sharing
- **Download PNG**: Export grid with labels included
- **Share Links**: Generate shareable URLs with embedded settings and image data
- **URL Restoration**: Load shared configurations from URLs

### Design
- **Pink Aesthetic Theme**: Modern, polished UI with gradient backgrounds
- **Responsive Design**: Optimized for desktop and mobile devices
- **Smooth Animations**: Polished interactions and transitions
- **Mobile Toast Notification**: Informative message for mobile users

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required!

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Lauwy222/pikcelgrid.git
   cd pikcelgrid
   ```

2. **That's it!** 
   The app is ready to use. Simply open `index.html` in your browser.

### Local Development

For local development, you can use any static file server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📖 Usage

### Basic Workflow

1. **Upload an Image**
   - Click the "Upload Image" button
   - Select a JPG, PNG, or WebP file
   - The grid will generate automatically

2. **Adjust Grid Size**
   - Use the slider or type a number (5-100)
   - Rows are calculated automatically to preserve aspect ratio

3. **Control Colors**
   - Set maximum colors (2-50)
   - The algorithm quantizes colors while maintaining visual quality

4. **Fine-tune (Advanced)**
   - Click "Advanced" to expand zoom and offset controls
   - Zoom: Focus on specific parts of the image
   - Offset: Pan the image within the grid

5. **Export or Share**
   - **Download**: Click "Download PNG" to save with labels
   - **Share**: Click "Share Link" to copy a shareable URL

### Tips

- **Large Images**: The app automatically scales images for efficient processing
- **Color Count**: Lower values (2-5) create more stylized, posterized effects
- **Grid Size**: Smaller grids (5-20) work best for simple images
- **Zoom**: Use zoom + offset to focus on specific image regions

## 🏗️ Architecture

### File Structure
```
pikcelgrid/
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
├── app.js          # Core application logic
└── README.md       # This file
```

### Technology Stack
- **Pure Vanilla JavaScript**: No frameworks or dependencies
- **HTML5 Canvas**: For efficient grid rendering
- **CSS3**: Modern styling with gradients and animations
- **LocalStorage**: For mobile toast dismissal state

### Key Algorithms

#### Color Quantization
Uses a threshold-based bucket approach:
1. Divides RGB color space into bins
2. Groups similar colors into buckets
3. Merges closest colors when exceeding max count
4. Guarantees exact color count output

#### Image Scaling
- Scales images to grid dimensions before processing
- Applies zoom and offset transformations
- Uses high-quality image smoothing

#### Grid Generation
- Calculates rows from aspect ratio
- Samples pixels efficiently
- Maps colors to quantized palette
- Renders with Canvas API

## 🌐 Deployment

### Cloudflare Pages

This app is designed for Cloudflare Pages deployment:

1. **Connect Repository**
   - Go to Cloudflare Dashboard → Pages
   - Connect your GitHub repository

2. **Build Settings**
   - **Build command**: (leave empty - no build step)
   - **Build output directory**: `/` (root)
   - **Framework preset**: None

3. **Deploy**
   - Cloudflare Pages will automatically deploy
   - Your app will be live at `your-project.pages.dev`

### Alternative Hosting

Works on any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any web server

## 🎨 Customization

### Theme Colors

Edit `styles.css` to customize the pink theme:

```css
/* Main gradient background */
background: linear-gradient(135deg, #ff9ec4 0%, #ffb3d1 50%, #ffc8df 100%);

/* Accent colors */
#ff6b9d  /* Primary pink */
#ffe0ec  /* Light pink */
```

### Grid Cell Size

Change `CELL_SIZE` constant in `app.js`:

```javascript
const CELL_SIZE = 30; // Pixels per grid cell
```

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (with limitations)

**Note**: Mobile support is currently limited. A desktop-optimized experience is recommended.

## 🐛 Known Issues

- Large images (>6000 character URLs) cannot be shared via URL
- Mobile devices show a notification about desktop-only use
- Very large grids (100+ columns) may be slow on older devices

## 🔮 Future Improvements

- [ ] Full mobile support
- [ ] Additional export formats (SVG, PDF)
- [ ] Custom color palette selection
- [ ] Grid pattern presets
- [ ] Batch processing
- [ ] Undo/redo functionality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💝 Credits

**Built to belong to you. From Laurens to Linouk ❤️**

---

Made with ❤️ using vanilla JavaScript, HTML5, and CSS3.

