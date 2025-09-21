// Vue Router Setup
const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// Simple routes
const routes = [
  { path: '/', redirect: '/add' },
  { 
    path: '/add', 
    component: {
      template: `
        <div class="page">
          <div class="url-input-section">
            <label for="urls">Enter Image URLs (one per line):</label>
            <textarea
              id="urls"
              v-model="$root.urlInput"
              class="url-textarea"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.png&#10;https://example.com/animation.gif"
            ></textarea>
          </div>

          <button
            class="download-btn"
            @click="$root.downloadImages"
            :disabled="$root.downloading || !$root.urlInput.trim()"
          >
            <i class="fas fa-download"></i>
            {{ $root.downloading ? 'Downloading...' : 'Download Images' }}
          </button>

          <div v-if="$root.downloading" class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: $root.downloadProgress + '%' }"
            ></div>
          </div>

          <div v-if="$root.downloadStatus" class="success-message">
            {{ $root.downloadStatus }}
          </div>

          <div v-if="$root.downloadErrors.length > 0" class="error-message">
            <strong>Some downloads failed:</strong>
            <ul>
              <li v-for="error in $root.downloadErrors" :key="error">{{ error }}</li>
            </ul>
          </div>
        </div>
      `
    }
  },
  { 
    path: '/gallery', 
    component: {
      template: `
        <div class="page">
          <div class="gallery-controls">
            <div class="view-controls">
              <button
                class="view-btn"
                :class="{ active: $root.viewMode === 'grid' }"
                @click="$root.viewMode = 'grid'"
              >
                <i class="fas fa-th"></i> Grid
              </button>
              <button
                class="view-btn"
                :class="{ active: $root.viewMode === 'list' }"
                @click="$root.viewMode = 'list'"
              >
                <i class="fas fa-list"></i> List
              </button>
            </div>

            <div
              v-if="$root.selectionMode || $root.selectedImages.length > 0"
              class="selection-actions"
            >
              <span class="selected-count">{{ $root.selectedImages.length }} selected</span>
              <button
                class="action-btn"
                @click="$root.exportSelected"
                :disabled="$root.selectedImages.length === 0"
              >
                <i class="fas fa-download"></i> Export
              </button>
              <button
                class="action-btn"
                @click="$root.deleteSelected"
                :disabled="$root.selectedImages.length === 0"
              >
                <i class="fas fa-trash"></i> Delete
              </button>
              <button class="action-btn" @click="$root.clearSelection">
                <i class="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>

          <div v-if="$root.images.length === 0" class="empty-gallery">
            <i class="fas fa-images"></i>
            <h3>No images in gallery</h3>
            <p>Add some images using the "Add Images" tab</p>
          </div>

          <div
            v-else
            :class="['gallery', $root.viewMode === 'grid' ? 'gallery-grid' : 'gallery-list']"
          >
            <div
              v-for="image in $root.images"
              :key="image.id"
              :class="[
                'image-item', 
                $root.viewMode + '-view',
                { selected: $root.selectedImages.includes(image.id) },
                { 'selection-mode': $root.selectionMode }
              ]"
              @click="$root.handleImageClick(image)"
              @contextmenu.prevent="$root.toggleSelection(image.id)"
              @touchstart="$root.handleTouchStart(image.id)"
              @touchend="$root.handleTouchEnd"
            >
              <img
                :src="image.thumbnailUrl || image.url"
                :alt="image.name"
                class="image-thumbnail"
              />
              <div class="image-info">
                <div class="image-name">{{ image.name }}</div>
                <div class="image-size">{{ $root.formatFileSize(image.size) }}</div>
              </div>
              <div class="selection-overlay">
                <i class="fas fa-check"></i>
              </div>
            </div>
          </div>
        </div>
      `
    }
  },
  { 
    path: '/image/:id', 
    component: {
      template: `
        <div class="page" v-if="$root.selectedImage">
          <div class="single-image-container" @click="$root.toggleControls">
            <img
              :src="$root.selectedImage.url"
              :alt="$root.selectedImage.name"
              class="single-image"
            />
            <div class="image-controls" :class="{ visible: $root.controlsVisible }">
              <button
                class="control-btn"
                @click.stop="$root.toggleFullscreen"
                :title="$root.isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
              >
                <i :class="$root.isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
              </button>
              <button
                class="control-btn"
                @click.stop="$root.exportImage($root.selectedImage)"
                title="Export"
              >
                <i class="fas fa-download"></i>
              </button>
              <button
                class="control-btn"
                @click.stop="$root.deleteImage($root.selectedImage.id)"
                title="Delete"
              >
                <i class="fas fa-trash"></i>
              </button>
              <button
                class="control-btn"
                @click.stop="$router.push('/gallery')"
                title="Back to Gallery"
              >
                <i class="fas fa-arrow-left"></i>
              </button>
            </div>
          </div>

          <div class="image-details">
            <div class="detail-row">
              <strong>Name:</strong>
              <span>{{ $root.selectedImage.name }}</span>
            </div>
            <div class="detail-row">
              <strong>Size:</strong>
              <span>{{ $root.formatFileSize($root.selectedImage.size) }}</span>
            </div>
            <div class="detail-row">
              <strong>Type:</strong>
              <span>{{ $root.selectedImage.type }}</span>
            </div>
            <div class="detail-row">
              <strong>Added:</strong>
              <span>{{ $root.formatDate($root.selectedImage.addedAt) }}</span>
            </div>
          </div>
        </div>
      `,
      async beforeRouteEnter(to, from, next) {
        next(async (vm) => {
          const imageId = parseFloat(to.params.id);

          // If images haven't loaded yet, wait for loadImages to complete
          if (!vm.$root.images || vm.$root.images.length === 0) {
            try {
              // If DB isn't ready yet, initialize
              if (!vm.$root.db) {
                await vm.$root.initDB();
              }
              await vm.$root.loadImages();
            } catch (e) {
              console.error('Failed to load images for route:', e);
            }
          }

          const image = vm.$root.images.find(img => img.id === imageId);
          if (image) {
            vm.$root.selectedImage = image;
            vm.$root.controlsVisible = false;
          } else {
            vm.$router.push('/gallery');
          }
        });
      }
    }
  }
];

const router = createRouter({ history: createWebHashHistory(), routes });

// Main Vue app
const app = createApp({
  data() {
    return {
      urlInput: "",
      downloading: false,
      downloadProgress: 0,
      downloadStatus: "",
      downloadErrors: [],
      images: [],
      viewMode: "grid",
      selectionMode: false,
      selectedImages: [],
      selectedImage: null,
      controlsVisible: false,
      db: null,
      touchTimer: null,
      longPressDelay: 500,
      isDarkMode: false,
      isFullscreen: false,
    };
  },
  async mounted() {
    this.initDarkMode();
    await this.initDB();
    await this.loadImages();
    this.initFullscreenListeners();
  },
  methods: {
    async initDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open("GalleryDB", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("images")) {
            const store = db.createObjectStore("images", { keyPath: "id" });
            store.createIndex("addedAt", "addedAt", { unique: false });
          }
        };
      });
    },

    async loadImages() {
      const transaction = this.db.transaction(["images"], "readonly");
      const store = transaction.objectStore("images");
      const request = store.getAll();

      request.onsuccess = () => {
        this.images = request.result.map(image => {
          if (image.blob) {
            image.url = URL.createObjectURL(image.blob);
            if (image.blob.type.startsWith("image/") && !image.thumbnailUrl) {
              this.createThumbnail(image.blob).then(thumbnailUrl => {
                image.thumbnailUrl = thumbnailUrl;
              });
            } else if (image.thumbnailBlob) {
              image.thumbnailUrl = URL.createObjectURL(image.thumbnailBlob);
            }
          }
          return image;
        }).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      };
    },

    async downloadImages() {
      const urls = this.urlInput.split("\n").filter((url) => url.trim());
      if (urls.length === 0) return;

      this.downloading = true;
      this.downloadProgress = 0;
      this.downloadStatus = "";
      this.downloadErrors = [];

      let completed = 0;
      const successful = [];

      for (const url of urls) {
        try {
          const response = await fetch(url.trim());
          if (!response.ok) throw new Error("HTTP " + response.status);

          const blob = await response.blob();
          const urlObj = new URL(url.trim());
          const fileName = urlObj.pathname.split("/").pop() || ("image_" + Date.now());

          const image = {
            id: Date.now() + Math.random(),
            name: fileName,
            url: URL.createObjectURL(blob),
            blob: blob,
            size: blob.size,
            type: blob.type,
            addedAt: new Date().toISOString(),
            originalUrl: url.trim(),
          };

          if (blob.type.startsWith("image/")) {
            image.thumbnailUrl = await this.createThumbnail(blob);
          }

          await this.saveImage(image);
          successful.push(fileName);
        } catch (error) {
          this.downloadErrors.push(url.trim() + ": " + error.message);
        }

        completed++;
        this.downloadProgress = (completed / urls.length) * 100;
      }

      await this.loadImages();
      this.downloading = false;

      if (successful.length > 0) {
        this.downloadStatus = "Successfully downloaded " + successful.length + " image" + (successful.length > 1 ? "s" : "");
        this.urlInput = "";
      }
    },

    async createThumbnail(blob) {
      return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        img.onload = () => {
          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };

        img.src = URL.createObjectURL(blob);
      });
    },

    async saveImage(image) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(["images"], "readwrite");
        const store = tx.objectStore("images");
        store.add(image);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("Failed to save image"));
        tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
      });
    },

    handleImageClick(image) {
      if (this.selectionMode || this.selectedImages.length > 0) {
        this.toggleSelection(image.id);
      } else {
        this.selectedImage = image;
        this.$router.push("/image/" + image.id);
        this.controlsVisible = false;
      }
    },

    handleTouchStart(imageId) {
      this.touchTimer = setTimeout(() => {
        this.toggleSelection(imageId);
      }, this.longPressDelay);
    },

    handleTouchEnd() {
      if (this.touchTimer) {
        clearTimeout(this.touchTimer);
        this.touchTimer = null;
      }
    },

    toggleSelection(imageId) {
      const index = this.selectedImages.indexOf(imageId);
      if (index > -1) {
        this.selectedImages.splice(index, 1);
      } else {
        this.selectedImages.push(imageId);
      }
      this.selectionMode = this.selectedImages.length > 0;
    },

    clearSelection() {
      this.selectedImages = [];
      this.selectionMode = false;
    },

    async deleteSelected() {
      const count = this.selectedImages.length;
      const confirmMsg = "Delete " + count + " image" + (count > 1 ? "s" : "") + "?";
      if (confirm(confirmMsg)) {
        // Revoke object URLs first
        for (const imageId of this.selectedImages) {
          const image = this.images.find((img) => img.id === imageId);
          if (image) {
            try { URL.revokeObjectURL(image.url); } catch {}
            try { if (image.thumbnailUrl) URL.revokeObjectURL(image.thumbnailUrl); } catch {}
          }
        }

        // Delete from IndexedDB in a single transaction
        await new Promise((resolve, reject) => {
          const tx = this.db.transaction(["images"], "readwrite");
          const store = tx.objectStore("images");
          for (const imageId of this.selectedImages) {
            store.delete(imageId);
          }
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error || new Error("Failed to delete selected images"));
          tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
        });

        await this.loadImages();
        this.clearSelection();
      }
    },

    async exportSelected() {
      for (const imageId of this.selectedImages) {
        const image = this.images.find((img) => img.id === imageId);
        if (image) {
          this.exportImage(image);
        }
      }
      this.clearSelection();
    },

    exportImage(image) {
      const a = document.createElement("a");
      a.href = image.url;
      a.download = image.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },

    async deleteImage(imageId) {
      if (confirm("Delete this image?")) {
        const image = this.images.find((img) => img.id === imageId);
        if (image) {
          try { URL.revokeObjectURL(image.url); } catch {}
          try { if (image.thumbnailUrl) URL.revokeObjectURL(image.thumbnailUrl); } catch {}
        }

        await new Promise((resolve, reject) => {
          const tx = this.db.transaction(["images"], "readwrite");
          const store = tx.objectStore("images");
          store.delete(imageId);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error || new Error("Failed to delete image"));
          tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
        });

        await this.loadImages();
        this.$router.push("/gallery");
      }
    },

    toggleControls() {
      this.controlsVisible = !this.controlsVisible;
    },

    formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    },

    initDarkMode() {
      const savedTheme = localStorage.getItem('gallery-app-theme');
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme();
    },

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      this.applyTheme();
      localStorage.setItem('gallery-app-theme', this.isDarkMode ? 'dark' : 'light');
    },

    applyTheme() {
      if (this.isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    },

    toggleFullscreen() {
      if (this.isFullscreen) {
        this.exitFullscreen();
      } else {
        this.enterFullscreen();
      }
    },

    enterFullscreen() {
      const container = document.querySelector('.single-image-container');
      if (container && container.requestFullscreen) {
        container.requestFullscreen()
          .then(() => {
            this.isFullscreen = true;
            this.controlsVisible = true;
          })
          .catch(err => {
            console.error('Failed to enter fullscreen:', err);
          });
      } else if (container && container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
        this.isFullscreen = true;
        this.controlsVisible = true;
      } else if (container && container.msRequestFullscreen) {
        container.msRequestFullscreen();
        this.isFullscreen = true;
        this.controlsVisible = true;
      }
    },

    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => {
            this.isFullscreen = false;
          })
          .catch(err => {
            console.error('Failed to exit fullscreen:', err);
          });
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        this.isFullscreen = false;
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
        this.isFullscreen = false;
      }
    },

    initFullscreenListeners() {
      const fullscreenChangeHandler = () => {
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        );
        this.isFullscreen = isCurrentlyFullscreen;
      };

      document.addEventListener('fullscreenchange', fullscreenChangeHandler);
      document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
      document.addEventListener('msfullscreenchange', fullscreenChangeHandler);
    }
  }
});

app.use(router);
app.mount("#app");