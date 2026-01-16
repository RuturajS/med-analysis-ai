import cv2
import numpy as np
import easyocr
from typing import Tuple

class PrescriptionProcessor:
    def __init__(self):
        # Initialize EasyOCR reader (supports handwritten text)
        self.reader = easyocr.Reader(['en'], gpu=False)
    
    def preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Preprocess prescription image for better OCR accuracy
        - Convert to grayscale
        - Denoise
        - Enhance contrast
        - Deskew if needed
        """
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, h=10)
        
        # Enhance contrast using CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)
        
        # Adaptive thresholding for better text extraction
        thresh = cv2.adaptiveThreshold(
            enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        return thresh
    
    def extract_text(self, processed_image: np.ndarray) -> Tuple[str, list]:
        """
        Extract text from preprocessed image using EasyOCR
        Returns: (full_text, detailed_results)
        """
        # EasyOCR expects RGB image
        if len(processed_image.shape) == 2:
            rgb_image = cv2.cvtColor(processed_image, cv2.COLOR_GRAY2RGB)
        else:
            rgb_image = processed_image
        
        # Perform OCR
        results = self.reader.readtext(rgb_image)
        
        # Extract text and confidence scores
        full_text = " ".join([item[1] for item in results])
        
        return full_text, results
    
    def process_prescription(self, image_bytes: bytes) -> Tuple[str, list]:
        """
        Main processing pipeline: preprocess + OCR
        """
        processed_img = self.preprocess_image(image_bytes)
        text, details = self.extract_text(processed_img)
        return text, details
