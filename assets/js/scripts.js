// Vue Router Setup
const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// Simple routes
const routes = [
  { path: "/", redirect: "/add" },
  {
    path: "/add",
    component: {
      template: `
        <div class="page">
          <div class="upload-tabs">
            <button 
              class="upload-tab-btn" 
              :class="{ active: $root.uploadMode === 'url' }"
              @click="$root.uploadMode = 'url'"
            >
              <i class="fas fa-link"></i> From URLs
            </button>
            <button 
              class="upload-tab-btn" 
              :class="{ active: $root.uploadMode === 'file' }"
              @click="$root.uploadMode = 'file'"
            >
              <i class="fas fa-upload"></i> Upload Files
            </button>
          </div>

          <!-- URL Upload Section -->
          <div v-if="$root.uploadMode === 'url'" class="url-input-section">
            <label for="urls">Enter Image URLs (one per line):</label>
            <textarea
              id="urls"
              v-model="$root.urlInput"
              class="url-textarea"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.png&#10;https://example.com/animation.gif"
            ></textarea>
            </div>

            <div v-if="$root.selectedFiles.length > 0" class="selected-files">
              <h4>Selected Files ({{ $root.selectedFiles.length }}):</h4>
              <div class="file-list">
                <div 
                  v-for="(file, index) in $root.selectedFiles" 
                  :key="index"
                  class="file-item"
                >
                  <div class="file-info">
                    <i class="fas fa-image"></i>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ $root.formatFileSize(file.size) }}</span>
                  </div>
                  <button 
                    class="remove-file-btn"
                    @click="$root.removeSelectedFile(index)"
                    title="Remove file"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <button
                class="upload-btn"
                @click="$root.uploadFiles"
                :disabled="$root.uploading || $root.selectedFiles.length === 0"
              >
                <i class="fas fa-upload"></i>
                {{ $root.uploading ? 'Uploading...' : 'Upload ' + $root.selectedFiles.length + ' file(s)' }}
              </button>
            </div>
          </div>

          <!-- Progress Bar (shared for both modes) -->
          <div v-if="$root.downloading || $root.uploading" class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: ($root.uploadMode === 'file' ? $root.uploadProgress : $root.downloadProgress) + '%' }"
            ></div>
            <div class="progress-text">
              {{ $root.uploadMode === 'file' ? $root.uploadProgress : $root.downloadProgress }}%
              <span v-if="$root.uploadMode === 'file' && $root.currentUploadFile">
                - {{ $root.currentUploadFile }}
              </span>
            </div>
          </div>

          <div v-if="$root.downloadStatus || $root.uploadStatus" class="success-message">
            {{ $root.downloadStatus || $root.uploadStatus }}
          </div>

          <div v-if="$root.downloadErrors.length > 0 || $root.uploadErrors.length > 0" class="error-message">
            <strong>Some {{ $root.uploadMode === 'file' ? 'uploads' : 'downloads' }} failed:</strong>
            <ul>
              <li v-for="error in ($root.uploadMode === 'file' ? $root.uploadErrors : $root.downloadErrors)" :key="error">{{ error }}</li>
            </ul>
          </div>
        </div>
      `,
    },
  },
  {
    path: "/gallery",
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
      `,
    },
  },
  {
    path: "/gallery/:img_id",
    component: {
      template: `
        <div class="page" v-if="$root.selectedImage">
          <div
            class="single-image-container"
            @click="$root.toggleControls"
            @touchstart.passive="$root.onSingleTouchStart"
            @touchend.passive="$root.onSingleTouchEnd"
          >
            <img
              :src="$root.selectedImage.url"
              :alt="$root.selectedImage.name"
              class="single-image"
            />
            <div class="image-controls" :class="{ visible: $root.controlsVisible }">
              <button
                class="control-btn"
                @click.stop="$root.toggleSlideshow"
                :title="$root.slideshowPlaying ? 'Pause Slideshow' : 'Play Slideshow'"
              >
                <i :class="$root.slideshowPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
              </button>
              <button
                class="control-btn"
                @click.stop="$root.cycleSlideshowSpeed"
                :title="'Speed: ' + ($root.slideshowIntervalMs/1000) + 's'"
              >
                <i class="fas fa-clock"></i>
              </button>
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
                v-if="!$root.isFullscreen"
                class="control-btn"
                @click.stop="$root.goBack"
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
          await vm.$root.selectImageById(parseFloat(to.params.img_id));
        });
      },
      async beforeRouteUpdate(to, from, next) {
        await this.$root.selectImageById(parseFloat(to.params.img_id));
        next();
      },
      beforeRouteLeave(to, from, next) {
        // Stop slideshow when navigating away from single image view
        if (this.$root && typeof this.$root.stopSlideshow === "function") {
          this.$root.stopSlideshow();
        }
        next();
      },
    },
  },
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
      // Swipe navigation state (single image view)
      swipeStartX: 0,
      swipeStartY: 0,
      swipeStartTime: 0,
      // Slideshow state
      slideshowPlaying: false,
      slideshowIntervalMs: 3000,
      slideshowTimer: null,
      // File upload properties
      uploadMode: "url", // 'url' or 'file'
      selectedFiles: [],
      uploading: false,
      uploadProgress: 0,
      uploadStatus: "",
      uploadErrors: [],
      currentUploadFile: "",
      isDragging: false,
      // Storage tracking
      usedStorage: 0,
      totalStorage: 0,
      storageUpdateInterval: null,
    };
  },
  watch: {
    // Watch for changes to the images array and update storage info
    images: {
      handler: async function (newImages, oldImages) {
        // Only update if the array length changed (images added/removed)
        if (!oldImages || newImages.length !== oldImages.length) {
          await this.updateStorageInfo();
        }
      },
      deep: false, // We only care about array length changes, not deep object changes
    },
  },
  async mounted() {
    this.initDarkMode();
    await this.initDB();
    await this.loadImages();
    await this.updateStorageInfo();
    this.initFullscreenListeners();
    this.startStorageMonitoring();
    this.addKeyboardListeners();
    this.initVisibilitySlideshowHandler();
  },
  beforeUnmount() {
    // Clean up the storage monitoring interval
    if (this.storageUpdateInterval) {
      clearInterval(this.storageUpdateInterval);
    }
    // Remove visibility handler
    if (this._visibilityHandler) {
      document.removeEventListener("visibilitychange", this._visibilityHandler);
      this._visibilityHandler = null;
    }
    // Stop slideshow if running
    this.stopSlideshow && this.stopSlideshow();
    this.removeKeyboardListeners();
  },
  methods: {
    // Slideshow helpers
    startSlideshow() {
      if (this.slideshowTimer) {
        clearInterval(this.slideshowTimer);
        this.slideshowTimer = null;
      }
      if (!this.selectedImage) return;
      this.slideshowPlaying = true;
      this.slideshowTimer = setInterval(() => {
        // Advance to next image, wrap at end
        const idx = this.getCurrentImageIndex();
        if (idx === -1) return;
        const next = (idx + 1) % this.images.length;
        this.navigateToIndex(next);
      }, this.slideshowIntervalMs);
    },

    pauseSlideshow() {
      this.slideshowPlaying = false;
      if (this.slideshowTimer) {
        clearInterval(this.slideshowTimer);
        this.slideshowTimer = null;
      }
    },

    stopSlideshow() {
      this.pauseSlideshow();
    },

    toggleSlideshow() {
      if (this.slideshowPlaying) this.pauseSlideshow();
      else this.startSlideshow();
    },

    setSlideshowSpeed(ms) {
      this.slideshowIntervalMs = ms;
      if (this.slideshowPlaying) {
        // restart timer with new speed
        this.startSlideshow();
      }
    },

    cycleSlideshowSpeed() {
      const speeds = [2000, 3000, 5000];
      const idx = speeds.indexOf(this.slideshowIntervalMs);
      const next = speeds[(idx + 1) % speeds.length];
      this.setSlideshowSpeed(next);
    },

    initVisibilitySlideshowHandler() {
      this._visibilityHandler = () => {
        if (document.hidden) {
          // Pause when hidden to save resources
          if (this.slideshowPlaying) {
            this._wasPlayingBeforeHide = true;
            this.pauseSlideshow();
          } else {
            this._wasPlayingBeforeHide = false;
          }
        } else {
          // Resume only if it was playing before
          if (this._wasPlayingBeforeHide) {
            this.startSlideshow();
          }
        }
      };
      document.addEventListener("visibilitychange", this._visibilityHandler);
    },
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

      request.onsuccess = async () => {
        this.images = request.result
          .map((image) => {
            if (image.blob) {
              image.url = URL.createObjectURL(image.blob);
              if (image.blob.type.startsWith("image/") && !image.thumbnailUrl) {
                this.createThumbnail(image.blob).then((thumbnailUrl) => {
                  image.thumbnailUrl = thumbnailUrl;
                });
              } else if (image.thumbnailBlob) {
                image.thumbnailUrl = URL.createObjectURL(image.thumbnailBlob);
              }
            }
            return image;
          })
          .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

        // Update storage info whenever images are loaded
        await this.updateStorageInfo();
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
          const fileName =
            urlObj.pathname.split("/").pop() || "image_" + Date.now();

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

          if (blob.type.startsWith("image/") && blob.type !== "image/gif") {
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
      await this.updateStorageInfo();
      this.downloading = false;

      if (successful.length > 0) {
        this.downloadStatus =
          "Successfully downloaded " +
          successful.length +
          " image" +
          (successful.length > 1 ? "s" : "");
        this.urlInput = "";
      }
    },

    // File upload methods
    triggerFileSelect() {
      const fileInput = this.$el.querySelector('input[type="file"]');
      if (fileInput) fileInput.click();
    },

    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.addSelectedFiles(files);
    },

    handleDragOver(event) {
      this.isDragging = true;
    },

    handleDragLeave(event) {
      this.isDragging = false;
    },

    handleFileDrop(event) {
      this.isDragging = false;
      const files = Array.from(event.dataTransfer.files);
      this.addSelectedFiles(files);
    },

    addSelectedFiles(files) {
      const imageFiles = files.filter((file) => {
        const validTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        return validTypes.includes(file.type);
      });

      if (imageFiles.length !== files.length) {
        alert(
          `${
            files.length - imageFiles.length
          } file(s) were skipped. Only image files are supported.`
        );
      }

      this.selectedFiles = [...this.selectedFiles, ...imageFiles];
    },

    removeSelectedFile(index) {
      this.selectedFiles.splice(index, 1);
    },

    async uploadFiles() {
      if (this.selectedFiles.length === 0) return;

      this.uploading = true;
      this.uploadProgress = 0;
      this.uploadStatus = "";
      this.uploadErrors = [];

      let completed = 0;
      const successful = [];

      for (const file of this.selectedFiles) {
        try {
          this.currentUploadFile = file.name;

          const image = {
            id: Date.now() + Math.random(),
            name: file.name,
            url: URL.createObjectURL(file),
            blob: file,
            size: file.size,
            type: file.type,
            addedAt: new Date().toISOString(),
          };

          // Create thumbnail for supported formats (skip GIFs to preserve animation)
          if (file.type.startsWith("image/") && file.type !== "image/gif") {
            image.thumbnailUrl = await this.createThumbnail(file);
          }

          await this.saveImage(image);
          successful.push(file.name);
        } catch (error) {
          this.uploadErrors.push(file.name + ": " + error.message);
        }

        completed++;
        this.uploadProgress = (completed / this.selectedFiles.length) * 100;
      }

      await this.loadImages();
      await this.updateStorageInfo();
      this.uploading = false;
      this.currentUploadFile = "";

      if (successful.length > 0) {
        this.uploadStatus =
          "Successfully uploaded " +
          successful.length +
          " image" +
          (successful.length > 1 ? "s" : "");
        this.selectedFiles = [];
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
        tx.onerror = () =>
          reject(tx.error || new Error("Failed to save image"));
        tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
      });
    },

    handleImageClick(image) {
      if (this.selectionMode || this.selectedImages.length > 0) {
        this.toggleSelection(image.id);
      } else {
        this.selectedImage = image;
        this.$router.push("/gallery/" + image.id);
        this.controlsVisible = false;
      }
    },

    goBack() {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        // Use browser's back functionality (like router.back() in Next.js)
        window.history.back();
      } else {
        // Fallback to gallery route if no history
        this.$router.push("/gallery");
      }
    },

    // Keyboard navigation for single image view
    addKeyboardListeners() {
      this._keyHandler = (e) => {
        if (!this.selectedImage) return; // Only when viewing a single image
        // Ignore if focused on input/textarea
        const tag =
          (document.activeElement && document.activeElement.tagName) || "";
        if (/(INPUT|TEXTAREA|SELECT)/.test(tag)) return;

        if (e.key === "ArrowRight") {
          e.preventDefault();
          this.nextImage();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          this.prevImage();
        } else if (e.key === "Escape") {
          e.preventDefault();
          if (this.isFullscreen) this.exitFullscreen();
          else this.goBack();
        } else if (e.key.toLowerCase() === "f") {
          // Quick fullscreen toggle with "F"
          e.preventDefault();
          this.toggleFullscreen();
        } else if (e.key.toLowerCase() === "h") {
          // Toggle controls with "H"
          e.preventDefault();
          this.toggleControls();
        } else if (e.code === "Space") {
          // Space toggles slideshow
          e.preventDefault();
          this.toggleSlideshow();
        } else if (e.key === "1") {
          e.preventDefault();
          this.setSlideshowSpeed(2000);
        } else if (e.key === "2") {
          e.preventDefault();
          this.setSlideshowSpeed(3000);
        } else if (e.key === "3") {
          e.preventDefault();
          this.setSlideshowSpeed(5000);
        }
      };
      window.addEventListener("keydown", this._keyHandler);
    },

    removeKeyboardListeners() {
      if (this._keyHandler) {
        window.removeEventListener("keydown", this._keyHandler);
        this._keyHandler = null;
      }
    },

    getCurrentImageIndex() {
      if (!this.selectedImage) return -1;
      return this.images.findIndex((img) => img.id === this.selectedImage.id);
    },

    navigateToIndex(index) {
      if (index < 0 || index >= this.images.length) return;
      const img = this.images[index];
      if (!img) return;
      this.selectedImage = img;
      // keep controls state, only update route
      this.$router.push("/gallery/" + img.id);
    },

    nextImage() {
      const idx = this.getCurrentImageIndex();
      if (idx === -1) return;
      const next = Math.min(idx + 1, this.images.length - 1);
      if (next !== idx) this.navigateToIndex(next);
    },

    prevImage() {
      const idx = this.getCurrentImageIndex();
      if (idx === -1) return;
      const prev = Math.max(idx - 1, 0);
      if (prev !== idx) this.navigateToIndex(prev);
    },

    // Touch swipe for single image view
    onSingleTouchStart(e) {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const t = e.changedTouches[0];
      this.swipeStartX = t.clientX;
      this.swipeStartY = t.clientY;
      this.swipeStartTime = Date.now();
    },

    onSingleTouchEnd(e) {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - this.swipeStartX;
      const dy = t.clientY - this.swipeStartY;
      const dt = Date.now() - this.swipeStartTime;

      const minDistance = 40; // px
      const maxAngle = 30; // degrees from horizontal
      const maxTime = 600; // ms

      if (dt <= maxTime) {
        const distance = Math.hypot(dx, dy);
        if (distance >= minDistance) {
          const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
          if (angle < maxAngle || angle > 180 - maxAngle) {
            // Horizontal swipe
            if (dx < 0) this.nextImage();
            else this.prevImage();
          }
        }
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
      const confirmMsg =
        "Delete " + count + " image" + (count > 1 ? "s" : "") + "?";
      if (confirm(confirmMsg)) {
        // Revoke object URLs first
        for (const imageId of this.selectedImages) {
          const image = this.images.find((img) => img.id === imageId);
          if (image) {
            try {
              URL.revokeObjectURL(image.url);
            } catch {}
            try {
              if (image.thumbnailUrl) URL.revokeObjectURL(image.thumbnailUrl);
            } catch {}
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
          tx.onerror = () =>
            reject(tx.error || new Error("Failed to delete selected images"));
          tx.onabort = () =>
            reject(tx.error || new Error("Transaction aborted"));
        });

        await this.loadImages();
        await this.updateStorageInfo();
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
          try {
            URL.revokeObjectURL(image.url);
          } catch {}
          try {
            if (image.thumbnailUrl) URL.revokeObjectURL(image.thumbnailUrl);
          } catch {}
        }

        await new Promise((resolve, reject) => {
          const tx = this.db.transaction(["images"], "readwrite");
          const store = tx.objectStore("images");
          store.delete(imageId);
          tx.oncomplete = () => resolve();
          tx.onerror = () =>
            reject(tx.error || new Error("Failed to delete image"));
          tx.onabort = () =>
            reject(tx.error || new Error("Transaction aborted"));
        });

        await this.loadImages();
        await this.updateStorageInfo();
        this.$router.push("/gallery");
      }
    },

    toggleControls() {
      this.controlsVisible = !this.controlsVisible;

      // If hiding controls, show a brief hint that clicking will show them again
      if (!this.controlsVisible && !this.isFullscreen) {
        this.showControlsHint();
      }
    },

    showControlsHint() {
      // Create a temporary hint that fades away
      const container = document.querySelector(".single-image-container");
      if (!container) return;

      // Remove any existing hint
      const existingHint = container.querySelector(".controls-hint");
      if (existingHint) existingHint.remove();

      // Create hint element
      const hint = document.createElement("div");
      hint.className = "controls-hint";
      hint.innerHTML =
        '<i class="fas fa-mouse-pointer"></i> Click to show controls';
      hint.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 1000;
      `;

      container.appendChild(hint);

      // Show hint
      setTimeout(() => {
        hint.style.opacity = "1";
      }, 100);

      // Hide hint after 2 seconds
      setTimeout(() => {
        hint.style.opacity = "0";
        setTimeout(() => {
          if (hint.parentNode) hint.parentNode.removeChild(hint);
        }, 300);
      }, 2000);
    },

    formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    async updateStorageInfo() {
      try {
        // Calculate used storage from images
        this.usedStorage = this.images.reduce(
          (total, image) => total + image.size,
          0
        );

        // Estimate total available storage (IndexedDB quota)
        if ("storage" in navigator && "estimate" in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          this.totalStorage = estimate.quota || 0;
        } else {
          // Fallback estimation for browsers without storage.estimate
          this.totalStorage = 50 * 1024 * 1024 * 1024; // 50GB fallback
        }
      } catch (error) {
        console.error("Error updating storage info:", error);
        this.usedStorage = this.images.reduce(
          (total, image) => total + image.size,
          0
        );
        this.totalStorage = 0;
      }
    },

    getStoragePercentage() {
      if (this.totalStorage === 0) return 0;
      return Math.round((this.usedStorage / this.totalStorage) * 100);
    },

    startStorageMonitoring() {
      // Update storage info every 30 seconds to catch any changes
      this.storageUpdateInterval = setInterval(async () => {
        await this.updateStorageInfo();
      }, 30000);

      // Also update when window becomes visible (user switches back to tab)
      this._storageVisibilityHandler = async () => {
        if (!document.hidden) {
          await this.updateStorageInfo();
        }
      };
      document.addEventListener(
        "visibilitychange",
        this._storageVisibilityHandler
      );
    },

    async selectImageById(imageId) {
      try {
        // If images haven't loaded yet or DB isn't ready, initialize and load
        if (!this.db) {
          await this.initDB();
        }

        if (!this.images || this.images.length === 0) {
          await this.loadImages();
        }

        // Find the image
        const image = this.images.find((img) => img.id === imageId);
        if (image) {
          this.selectedImage = image;
          this.controlsVisible = false;
          return true;
        } else {
          // If image not found, try reloading images one more time
          await this.loadImages();
          const retryImage = this.images.find((img) => img.id === imageId);
          if (retryImage) {
            this.selectedImage = retryImage;
            this.controlsVisible = false;
            return true;
          } else {
            console.warn(`Image with ID ${imageId} not found`);
            this.$router.push("/gallery");
            return false;
          }
        }
      } catch (error) {
        console.error("Error selecting image:", error);
        this.$router.push("/gallery");
        return false;
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    },

    initDarkMode() {
      const savedTheme = localStorage.getItem("gallery-app-theme");
      this.isDarkMode = savedTheme === "dark";
      this.applyTheme();
    },

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      this.applyTheme();
      localStorage.setItem(
        "gallery-app-theme",
        this.isDarkMode ? "dark" : "light"
      );
    },

    applyTheme() {
      if (this.isDarkMode) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
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
      const container = document.querySelector(".single-image-container");
      if (container && container.requestFullscreen) {
        container
          .requestFullscreen()
          .then(() => {
            this.isFullscreen = true;
            // Don't automatically show controls - let user toggle them
          })
          .catch((err) => {
            console.error("Failed to enter fullscreen:", err);
          });
      } else if (container && container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
        this.isFullscreen = true;
        // Don't automatically show controls - let user toggle them
      } else if (container && container.msRequestFullscreen) {
        container.msRequestFullscreen();
        this.isFullscreen = true;
        // Don't automatically show controls - let user toggle them
      }
    },

    exitFullscreen() {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => {
            this.isFullscreen = false;
          })
          .catch((err) => {
            console.error("Failed to exit fullscreen:", err);
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

      document.addEventListener("fullscreenchange", fullscreenChangeHandler);
      document.addEventListener(
        "webkitfullscreenchange",
        fullscreenChangeHandler
      );
      document.addEventListener("msfullscreenchange", fullscreenChangeHandler);
    },
  },
});

app.use(router);
app.mount("#app");
