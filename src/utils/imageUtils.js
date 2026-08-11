// Shared helpers for processing uploaded profile photos.
// Photos are stored as data URLs inside the in-memory DB / localStorage,
// so large images are downscaled and compressed before they are saved.

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB (keeps memory usage in check)
export const MAX_DIMENSION = 512; // stored photos are resized to at most this size

// Reads the user's file and returns a resized, compressed JPEG data URL.
export function processImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Image processing is not supported in this browser.'));
          return;
        }
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      image.onerror = () => reject(new Error('Could not read the selected image.'));
      image.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}