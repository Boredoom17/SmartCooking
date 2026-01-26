import { INFERENCE_URL } from '@env';

// Types
export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
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
 * Detect ingredients from a base64 image
 * @param base64Image - Base64 encoded image string (without data:image prefix)
 */
export const detectIngredients = async (
  base64Image: string
): Promise<DetectionResult> => {
  try {
    const response = await fetch(`${INFERENCE_URL}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Detection error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
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
 * Get list of ingredients the model can detect
 */
export const getDetectableClasses = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${INFERENCE_URL}/classes`);
    const data: ClassesResponse = await response.json();
    return data.classes || [];
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    return [];
  }
};

/**
 * Convert React Native image picker result to base64
 * @param imageUri - URI from react-native-image-picker
 */
export const convertImageToBase64 = async (
  imageUri: string
): Promise<string> => {
  const response = await fetch(imageUri);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};