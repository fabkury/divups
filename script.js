class AnimationUpscaler {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.scaleFactor = document.getElementById('scaleFactor');
        this.processBtn = document.getElementById('processBtn');
        this.status = document.getElementById('status');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.fileType = document.getElementById('fileType');
        
        this.selectedFile = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // Process button
        this.processBtn.addEventListener('click', () => {
            this.processAnimation();
        });

        // Scale factor validation
        this.scaleFactor.addEventListener('input', () => {
            const value = parseInt(this.scaleFactor.value);
            if (value < 2) {
                this.scaleFactor.value = 2;
            } else if (value > 10) {
                this.scaleFactor.value = 10;
            }
        });
    }

    handleFileSelect(file) {
        // Validate file type
        const validTypes = ['image/gif', 'image/webp'];
        const validExtensions = ['.gif', '.webp'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
            this.showStatus('Please select a valid GIF or WebP file.', 'error');
            return;
        }

        this.selectedFile = file;
        this.updateFileInfo(file);
        this.processBtn.disabled = false;
        this.showStatus('File selected. Ready to process.', 'success');
    }

    updateFileInfo(file) {
        this.fileName.textContent = `Name: ${file.name}`;
        this.fileSize.textContent = `Size: ${this.formatFileSize(file.size)}`;
        this.fileType.textContent = `Type: ${file.type || 'Unknown'}`;
        this.fileInfo.classList.remove('hidden');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
        this.status.classList.remove('hidden');
    }

    async processAnimation() {
        if (!this.selectedFile) {
            this.showStatus('Please select a file first.', 'error');
            return;
        }

        const scale = parseInt(this.scaleFactor.value);
        if (scale < 2) {
            this.showStatus('Scale factor must be at least 2.', 'error');
            return;
        }

        this.processBtn.disabled = true;
        this.showStatus('Processing animation...', 'processing');

        try {
            const fileExtension = this.selectedFile.name.toLowerCase().substring(this.selectedFile.name.lastIndexOf('.'));
            
            if (fileExtension === '.gif') {
                await this.processGIF(scale);
            } else if (fileExtension === '.webp') {
                await this.processWebP(scale);
            } else {
                throw new Error('Unsupported file format');
            }
        } catch (error) {
            console.error('Processing error:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
        } finally {
            this.processBtn.disabled = false;
        }
    }

    async processGIF(scale) {
        this.showStatus('Reading GIF file...', 'processing');
        
        const arrayBuffer = await this.selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        this.showStatus('Decoding GIF frames...', 'processing');
        
        // Use ImageDecoder API to decode the GIF
        const decoder = new ImageDecoder({
            data: arrayBuffer,
            type: 'image/gif'
        });

        const { image: header } = await decoder.decode();
        const frameCount = decoder.tracks.selectedTrack.frameCount;
        
        this.showStatus(`Found ${frameCount} frames. Processing...`, 'processing');

        // Create GIF encoder
        const encoder = new gifenc.GIFEncoder();
        encoder.setRepeat(0); // Infinite loop
        encoder.setDelay(100); // Default delay, will be updated per frame
        encoder.start();

        // Process each frame
        for (let i = 0; i < frameCount; i++) {
            this.showStatus(`Processing frame ${i + 1}/${frameCount}...`, 'processing');
            
            const { image } = await decoder.decode({ frameIndex: i });
            const { duration } = decoder.tracks.selectedTrack.frameCount > 1 ? 
                await decoder.decode({ frameIndex: i }) : { duration: 100 };

            // Create canvas for upscaling
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to upscaled dimensions
            canvas.width = image.displayWidth * scale;
            canvas.height = image.displayHeight * scale;
            
            // Disable image smoothing for nearest-neighbor interpolation
            ctx.imageSmoothingEnabled = false;
            
            // Draw the frame upscaled
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Add frame to encoder
            encoder.setDelay(duration / 1000); // Convert to seconds
            encoder.addFrame(imageData.data, true);
        }

        this.showStatus('Encoding upscaled GIF...', 'processing');
        
        // Finish encoding
        encoder.finish();
        const gifBytes = encoder.bytes();
        
        // Create blob and download
        const blob = new Blob([gifBytes], { type: 'image/gif' });
        this.downloadFile(blob, this.getOutputFilename('.gif'));
        
        this.showStatus('GIF upscaled successfully!', 'success');
    }

    async processWebP(scale) {
        this.showStatus('Reading WebP file...', 'processing');
        
        const arrayBuffer = await this.selectedFile.arrayBuffer();
        
        this.showStatus('Decoding WebP frames...', 'processing');
        
        try {
            // Use ImageDecoder API to decode the WebP
            const decoder = new ImageDecoder({
                data: arrayBuffer,
                type: 'image/webp'
            });

            const { image: header } = await decoder.decode();
            const frameCount = decoder.tracks.selectedTrack.frameCount;
            
            this.showStatus(`Found ${frameCount} frames. Processing...`, 'processing');

            if (frameCount === 1) {
                // Static WebP - process as single frame
                await this.processStaticWebP(scale, arrayBuffer);
                return;
            }

            // Animated WebP - process all frames
            const frames = [];
            
            for (let i = 0; i < frameCount; i++) {
                this.showStatus(`Processing frame ${i + 1}/${frameCount}...`, 'processing');
                
                const { image } = await decoder.decode({ frameIndex: i });
                
                // Get frame duration properly
                let duration = 100; // Default 100ms
                try {
                    const track = decoder.tracks.selectedTrack;
                    if (track.frameCount > 1) {
                        // Get the actual frame duration from the track
                        const frameInfo = await decoder.decode({ frameIndex: i });
                        duration = frameInfo.image.duration || 100;
                    }
                } catch (e) {
                    // Fallback to default duration
                    duration = 100;
                }

                // Create canvas for upscaling
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size to upscaled dimensions
                canvas.width = image.displayWidth * scale;
                canvas.height = image.displayHeight * scale;
                
                // Disable image smoothing for nearest-neighbor interpolation
                ctx.imageSmoothingEnabled = false;
                
                // Draw the frame upscaled
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                
                // Get raw image data for lossless processing
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                frames.push({
                    imageData: imageData,
                    duration: duration,
                    width: canvas.width,
                    height: canvas.height
                });
            }

            this.showStatus('Creating animated output...', 'processing');
            
            // Since browser APIs don't support creating animated WebP,
            // we'll convert to animated GIF to preserve the animation
            await this.createAnimatedGIFFromWebP(frames, scale);
            
        } catch (error) {
            console.error('WebP processing error:', error);
            // Fallback: treat as static WebP
            this.showStatus('Treating as static WebP...', 'processing');
            await this.processStaticWebP(scale, arrayBuffer);
        }
    }

    async processStaticWebP(scale, arrayBuffer) {
        // Create image from array buffer
        const blob = new Blob([arrayBuffer], { type: 'image/webp' });
        const imageUrl = URL.createObjectURL(blob);
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // Create canvas for upscaling
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size to upscaled dimensions
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                // Disable image smoothing for nearest-neighbor interpolation
                ctx.imageSmoothingEnabled = false;
                
                // Draw the image upscaled
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to lossless WebP blob and download
                canvas.toBlob((blob) => {
                    this.downloadFile(blob, this.getOutputFilename('.webp'));
                    this.showStatus('Static WebP upscaled successfully!', 'success');
                    URL.revokeObjectURL(imageUrl);
                    resolve();
                }, 'image/webp', 1.0); // Use quality 1.0 for lossless
            };
            img.onerror = () => {
                URL.revokeObjectURL(imageUrl);
                reject(new Error('Failed to load WebP image'));
            };
            img.src = imageUrl;
        });
    }

    async createAnimatedGIFFromWebP(frames, scale) {
        // Convert animated WebP frames to animated GIF since browser APIs
        // don't support creating animated WebP files
        
        if (frames.length === 0) {
            throw new Error('No frames to process');
        }

        // Create GIF encoder
        const encoder = new gifenc.GIFEncoder();
        encoder.setRepeat(0); // Infinite loop
        encoder.start();

        // Add each frame to the GIF encoder
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            
            // Set delay for this frame (convert from milliseconds to centiseconds)
            encoder.setDelay(frame.duration / 10);
            
            // Add frame data to encoder
            encoder.addFrame(frame.imageData.data, true);
        }

        // Finish encoding
        encoder.finish();
        const gifBytes = encoder.bytes();
        
        // Create blob and download as GIF
        const blob = new Blob([gifBytes], { type: 'image/gif' });
        this.downloadFile(blob, this.getOutputFilename('.gif'));
        
        // Show detailed status about what was processed
        const totalDuration = frames.reduce((sum, frame) => sum + frame.duration, 0);
        this.showStatus(
            `Animated WebP converted to GIF successfully! ${frames.length} frames processed. ` +
            `Total duration: ${(totalDuration / 1000).toFixed(2)}s`, 
            'success'
        );
    }

    getOutputFilename(extension) {
        const originalName = this.selectedFile.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        return `${nameWithoutExt}_upscaled${extension}`;
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnimationUpscaler();
});