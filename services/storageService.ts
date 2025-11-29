import { RentalListing } from '../types';

const STORAGE_KEY = 'psub_homeprice_data_v1';
const API_URL = './api.php'; // Relative path to PHP script

// Helper to detect if we are running effectively in a server environment
const isServerEnv = () => {
    // Check if we are running on http/https (not file://)
    return window.location.protocol.startsWith('http');
};

export const getListings = async (): Promise<RentalListing[]> => {
  try {
    if (isServerEnv()) {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        }
    }
    throw new Error("API unavailable");
  } catch (error) {
    console.warn("Using LocalStorage fallback", error);
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }
};

// Convert Base64 DataURL to Blob
const dataURLtoBlob = (dataurl: string): Blob => {
    try {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (e) {
        console.error("Error converting data URL to blob", e);
        return new Blob([]);
    }
};

const uploadImages = async (base64Images: string[]): Promise<string[]> => {
    if (!base64Images || base64Images.length === 0) return [];
    
    // Filter only base64 images (skip already uploaded URLs that start with ./ or http)
    const imagesToUpload = base64Images.filter(img => img.startsWith('data:'));
    const existingUrls = base64Images.filter(img => !img.startsWith('data:'));

    if (imagesToUpload.length === 0) return existingUrls;

    const formData = new FormData();
    imagesToUpload.forEach((base64, index) => {
        const blob = dataURLtoBlob(base64);
        if (blob.size > 0) {
            // Append with a filename
            formData.append('files[]', blob, `img_${Date.now()}_${index}.jpg`);
        }
    });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            // result.paths contains the new paths
            return [...existingUrls, ...(result.paths || [])];
        } else {
            console.error("Upload failed");
            // Fallback: return original base64 if upload fails
            return base64Images;
        }
    } catch (e) {
        console.error("Upload error", e);
        return base64Images;
    }
};

export const saveListing = async (listing: RentalListing): Promise<RentalListing[]> => {
  // 1. Get current data
  const current = await getListings();

  try {
     if (isServerEnv()) {
         // 2. Upload images if they are base64
         // This transforms the base64 strings in the listing object to file paths
         const uploadedImagePaths = await uploadImages(listing.images);
         const listingWithPaths = { ...listing, images: uploadedImagePaths };

         // 3. Save JSON with the new paths
         const updated = [listingWithPaths, ...current];
         
         const response = await fetch(API_URL, {
             method: 'POST',
             headers: { 
                 'Content-Type': 'application/json',
                 'Accept': 'application/json'
             },
             body: JSON.stringify(updated)
         });
         
         if (!response.ok) throw new Error("Failed to save to server");
         
         // Log success
         console.log("Data saved successfully to server");
         return updated;
     } else {
         throw new Error("Not server env");
     }
  } catch (error) {
     console.warn("Saved to LocalStorage (Offline/Dev mode)");
     const updated = [listing, ...current];
     localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
     return updated;
  }
};

export const deleteListing = async (id: string): Promise<RentalListing[]> => {
  const current = await getListings();
  const updated = current.filter(item => item.id !== id);

  try {
    if (isServerEnv()) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        if (!response.ok) throw new Error("Failed to delete on server");
    } else {
        throw new Error("Not server env");
    }
 } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
 }
 
  return updated;
};

// Image Compression Logic
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000; // Increased resolution slightly
        const scaleSize = MAX_WIDTH / img.width;
        
        if (scaleSize < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
        } else {
            canvas.width = img.width;
            canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject("Canvas context not available");
            return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress to JPEG at 80% quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};