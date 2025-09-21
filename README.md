# Oracle Image Gallery App

A Progressive Web Application (PWA) for downloading, storing, and managing image collections. Built with Vue.js and designed for both desktop and mobile use.

## 🚀 Features

- **Image Download**: Download images from URLs in bulk
- **Gallery Management**: View, organize, and manage your downloaded images
- **Progressive Web App**: Install on your device for native-like experience
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Offline Support**: Service worker caching for offline functionality
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage**: Images are stored locally in your browser

## 📱 Screenshots

The app features a clean, modern interface with:
- Image URL input for bulk downloads
- Gallery view with image thumbnails
- Progress tracking during downloads
- Theme toggle for dark/light modes

## 🛠️ Technology Stack

- **Frontend Framework**: Vue.js 3 with Vue Router
- **Styling**: Custom CSS with FontAwesome icons
- **PWA Features**: Service Worker for caching and offline support
- **Icons**: FontAwesome 6.7.2
- **Storage**: Browser Local Storage API

## 📁 Project Structure

```
oracle_image_gallery/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for caching
├── LICENSE                 # License file
├── assets/
│   ├── css/
│   │   ├── styles.css      # Main stylesheet
│   │   └── font-awesome.css
│   ├── js/
│   │   ├── scripts.js      # Main Vue.js application
│   │   ├── vue.js          # Vue.js framework
│   │   └── vue-router.js   # Vue Router
│   ├── images/             # App icons and favicons
│   └── fontawesome-free-6.7.2-web/  # FontAwesome assets
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A web server (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/francismul/oracle_image_gallery.git
   cd oracle_image_gallery
   ```

2. **Serve the application**
   
   You can use any static file server. Here are a few options:

   **Using Python (if installed):**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Using Node.js (if installed):**
   ```bash
   npx http-server
   ```

   **Using PHP (if installed):**
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser**
   Navigate to `http://localhost:8000` (or the port shown by your server)

### Installing as PWA

1. Open the app in your browser
2. Look for the "Install" button in your browser's address bar
3. Click "Install" to add the app to your device
4. The app will now work offline and appear in your app launcher

## 📖 Usage

### Adding Images

1. Navigate to the "Add Images" tab
2. Enter image URLs (one per line) in the text area
3. Click "Download Images" to start the download process
4. Monitor progress via the progress bar
5. View any errors in the error messages section

### Viewing Gallery

1. Navigate to the "Gallery" tab
2. Browse your downloaded images in thumbnail view
3. Click on images to view them in full size
4. Use the search and filter options to organize your collection

### Theme Toggle

- Click the sun/moon icon in the header to switch between light and dark modes
- Your preference is saved locally

## 🔧 Configuration

### Service Worker

The service worker caches the following resources for offline use:
- Core application files (HTML, CSS, JS)
- FontAwesome assets
- App icons and images

### Manifest

The PWA manifest includes:
- App name and description
- Display mode (standalone)
- Theme colors
- Icon sets for various devices
- Start URL and scope

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

## 🐛 Known Issues

- Large images may take longer to download and store
- Browser storage limits may affect the number of images you can store
- Some browsers may require HTTPS for full PWA functionality

## 🔮 Future Enhancements

- [ ] Image editing capabilities
- [ ] Cloud storage integration
- [ ] Image categorization and tagging
- [ ] Bulk operations (delete, move, etc.)
- [ ] Image compression options
- [ ] Export functionality

## 📞 Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Ensure you're using a modern browser
3. Clear browser cache and try again
4. Open an issue on GitHub

## 🙏 Acknowledgments

- Vue.js team for the excellent framework
- FontAwesome for the icon library
- Contributors and users who provide feedback

---

**Made with ❤️ for image management and organization**