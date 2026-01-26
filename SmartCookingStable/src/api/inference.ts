import { INFERENCE_URL } from '@env';

// Types
export interface BoundingBox {
  x1: number;
  y1: number;
  y2: number;
}

export interface Detection {
  name: string;
  confidence: number;
  bounding_box: BoundingBox;
}

export interface DetectionResponse {
  success: true;
  detected_ingredients: string[];
  count: number;
  detections: Detection[];
  total_detections: number;
}

export interface DetectionError {
  success: false;
  error: string;
}

export type DetectionResult = DetectionResponse | DetectionError;

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  timestamp: string;
  classes_count: number;
}

export interface ClassesResponse {
  success: boolean;
  total: number;
  classes: string[];
}

/**
 * Clean text by removing all emojis and unwanted characters
 * @param text - Text to clean
 */
const cleanIngredientName = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove ALL emojis using comprehensive regex patterns
  let cleaned = text
    // Remove common problematic emojis first
    .replace(/[🚑👮‍♂️👨🚗👨❤️👨🤰🔢🎺🎷🎸🥁🏃‍♀️💃🧍‍♀️🚶‍♂️]/g, '')
    // Remove all Unicode emoji ranges
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')  // emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')  // symbols & pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')  // transport & map symbols
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')  // flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')    // misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')    // dingbats
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')  // supplemental symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, ''); // extended symbols

  // Remove zero-width joiners and variation selectors
  cleaned = cleaned
    .replace(/[\u200D]/g, '')
    .replace(/[\uFE0F]/g, '')
    .replace(/[\u200B]/g, '');

  // Remove any remaining non-food related patterns
  cleaned = cleaned
    .replace(/\b(ambulance|police|car|man|woman|person|runner|dancer|walker|pregnant)\b/gi, '')
    .replace(/\b(\d+)(st|nd|rd|th)\b/gi, '') // Remove numbered items like "1st", "2nd"
    .replace(/^\d+\s*[-.]?\s*/g, ''); // Remove leading numbers

  // Clean up extra spaces and trim
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .trim();

  // If after cleaning we have nothing meaningful, return original without emojis
  if (cleaned.length === 0 || cleaned.length < 2) {
    // Fallback: just remove emojis and return
    return text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
      .replace(/[\u200D\uFE0F\u200B]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return cleaned;
};

/**
 * Clean the entire detection response from the API
 */
const cleanDetectionResponse = (data: any): DetectionResult => {
  try {
    if (!data.success) {
      return data;
    }

    // Clean detected ingredients
    const cleanedIngredients = (data.detected_ingredients || []).map((ingredient: string) => {
      const cleaned = cleanIngredientName(ingredient);
      return cleaned.length > 0 ? cleaned : null;
    }).filter(Boolean) as string[];

    // Clean detection names
    const cleanedDetections = (data.detections || []).map((detection: Detection) => ({
      ...detection,
      name: cleanIngredientName(detection.name) || detection.name.replace(/[^\w\s]/gi, ''),
    })).filter((detection: Detection) => detection.name.length > 0);

    return {
      ...data,
      detected_ingredients: cleanedIngredients,
      detections: cleanedDetections,
      count: cleanedIngredients.length,
      total_detections: cleanedDetections.length,
    };
  } catch (error) {
    console.error('Error cleaning detection response:', error);
    return data;
  }
};

/**
 * Detect ingredients from a base64 image
 * @param base64Image - Base64 encoded image string (without data:image prefix)
 */
export const detectIngredients = async (
  base64Image: string
): Promise<DetectionResult> => {
  try {
    console.log('Sending request to Flask API...');
    const response = await fetch(`${INFERENCE_URL}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log('Raw API response:', rawData);
    
    // Clean the API response
    const cleanedData = cleanDetectionResponse(rawData);
    console.log('Cleaned response:', cleanedData);
    
    return cleanedData;
  } catch (error) {
    console.error('Detection error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Get list of ingredients the model can detect (with cleaning)
 */
export const getDetectableClasses = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${INFERENCE_URL}/classes`);
    const data: ClassesResponse = await response.json();
    
    // Clean the class names
    const cleanedClasses = (data.classes || []).map(cleanIngredientName)
      .filter(className => className.length > 0);
    
    console.log('Cleaned detectable classes:', cleanedClasses);
    return cleanedClasses;
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    return [];
  }
};

/**
 * Check if Flask server is healthy
 */
export const checkHealth = async (): Promise<HealthResponse | null> => {
  try {
    const response = await fetch(`${INFERENCE_URL}/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
};

/**
 * Convert React Native image picker result to base64
 * @param imageUri - URI from react-native-image-picker
 */
export const convertImageToBase64 = async (
  imageUri: string
): Promise<string> => {
  try {
    console.log('Converting image to base64...');
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64Data = base64.split(',')[1];
        console.log('Image converted to base64, length:', base64Data?.length || 0);
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};