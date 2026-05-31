import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

// Cosine similarity between two embedding vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Threshold for face match (tune this between 0.6-0.8)
export const RECOGNITION_THRESHOLD = 0.7;
export const LIVENESS_THRESHOLD = 0.5;

let isTfReady = false;

export async function initTF(): Promise<boolean> {
  if (isTfReady) return true;
  try {
    await tf.ready();
    isTfReady = true;
    console.log('TensorFlow.js ready. Backend:', tf.getBackend());
    return true;
  } catch (e) {
    console.error('TF init failed:', e);
    return false;
  }
}

// Preprocess image tensor for face recognition
// Input: raw pixel array (RGB), Output: normalized tensor
export function preprocessFace(
  pixelData: Uint8Array,
  width: number,
  height: number,
): tf.Tensor4D {
  return tf.tidy(() => {
    const tensor = tf.browser
      .fromPixels({data: pixelData, width, height})
      .resizeBilinear([112, 112])
      .toFloat()
      .div(127.5)
      .sub(1.0)
      .expandDims(0) as tf.Tensor4D;
    return tensor;
  });
}

// Compare two embeddings and return match result
export function compareFaces(
  embedding1: number[],
  embedding2: number[],
): {isMatch: boolean; confidence: number} {
  const similarity = cosineSimilarity(embedding1, embedding2);
  return {
    isMatch: similarity >= RECOGNITION_THRESHOLD,
    confidence: Math.round(similarity * 100),
  };
}

// Simple liveness check based on frame variance
// Real faces have more texture variation than printed photos
export function checkLivenessFromVariance(
  pixelData: Uint8Array,
  width: number,
  height: number,
): {isLive: boolean; score: number} {
  return tf.tidy(() => {
    const tensor = tf.browser
      .fromPixels({data: pixelData, width, height})
      .toFloat()
      .div(255.0);

    const mean = tensor.mean();
    const variance = tensor.sub(mean).square().mean().dataSync()[0];

    // Real faces typically have variance > 0.01
    const score = Math.min(variance * 100, 1.0);
    return {
      isLive: variance > 0.008,
      score: Math.round(score * 100),
    };
  });
}