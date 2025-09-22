# 🎬 Animation Upscaler

A simple, elegant web application that allows you to upscale animated GIF and WebP files using nearest-neighbor interpolation for pixel-perfect results. All processing is done client-side in your browser - no server required!

## ✨ Features

- **File Support**: Upload animated GIF and WebP files
- **Pixel-Perfect Upscaling**: Uses nearest-neighbor interpolation (no smoothing)
- **Custom Scale Factors**: Choose any integer scale factor from 2x to 10x
- **Client-Side Processing**: All processing happens in your browser - no data sent to servers
- **Automatic Download**: Upscaled files are automatically downloaded with "_upscaled" suffix
- **Modern UI**: Clean, responsive design that works on desktop and mobile
- **Drag & Drop**: Easy file upload with drag and drop support

## 🚀 How to Use

1. **Upload a File**: Click the upload area or drag and drop your animated GIF or WebP file
2. **Set Scale Factor**: Choose your desired upscale factor (2x, 3x, 4x, etc.)
3. **Process**: Click "Process Animation" and wait for the magic to happen
4. **Download**: Your upscaled animation will automatically download

## 🛠️ Technical Details

### Supported Formats
- **GIF**: Full animated GIF support with frame timing preservation
- **WebP**: 
  - Static WebP: Processed as lossless WebP output
  - Animated WebP: Processed as lossless animated WebP output (preserves all frames and timing)

### Processing Pipeline
1. **File Reading**: Uses FileReader API to read uploaded files
2. **Frame Decoding**: Leverages modern ImageDecoder API for frame extraction
3. **Upscaling**: HTML5 Canvas with `imageSmoothingEnabled = false` for nearest-neighbor interpolation
4. **Re-encoding**: 
   - GIF: Uses [gifenc](https://github.com/mattdesl/gifenc) library for encoding
   - Static WebP: Browser's native Canvas.toBlob() with quality 1.0 (lossless)
   - Animated WebP: Uses [webp-writer](https://github.com/webmproject/webp-writer) library for lossless animated WebP creation

### Browser Requirements
- Modern browsers with ImageDecoder API support
- Chrome 94+, Firefox 93+, Safari 16.4+
- JavaScript enabled

## 📁 Project Structure

```
├── index.html          # Main HTML file with embedded CSS
├── script.js           # JavaScript application logic
└── README.md          # This documentation
```

## 🔧 Dependencies

- **gifenc**: GIF encoding library (loaded via CDN)
- **webp-writer**: WebP encoding library for animated WebP creation (loaded via CDN)
- **ImageDecoder API**: Modern browser API for image frame decoding
- **HTML5 Canvas**: For image upscaling operations

## 🎯 Use Cases

- **Pixel Art**: Perfect for upscaling pixel art animations
- **Retro Graphics**: Maintain crisp edges in retro-style animations
- **Game Assets**: Upscale game sprites and animations
- **Social Media**: Create higher resolution versions of animated content

## ⚠️ Limitations

- **File Size**: Large files may cause memory issues in browsers
- **Browser Support**: Requires modern browsers with ImageDecoder API
- **Processing Time**: Large animations with many frames may take time to process
- **WebP Library**: Requires webp-writer library to be loaded for animated WebP creation

## 🚀 Deployment

This is a static website that can be deployed to any static hosting service:

- **GitHub Pages**: Automatically deployed from this repository
- **Netlify**: Drag and drop the files
- **Vercel**: Connect your GitHub repository
- **Any Web Server**: Just upload the files to your web server

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 🔗 Live Demo

Visit the live website: [https://yourusername.github.io/divups/](https://yourusername.github.io/divups/)

---

Made with ❤️ for the pixel art and animation community!