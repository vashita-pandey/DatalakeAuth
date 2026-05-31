import {NativeModules} from 'react-native';

const {TFLiteModule} = NativeModules;

// Initialize TFLite models
export async function initializeTFLite(): Promise<string> {
  try {
    const result = await TFLiteModule.initialize();
    console.log('TFLite:', result);
    return result;
  } catch (e: any) {
    console.error('TFLite init error:', e);
    throw e;
  }
}

// Get 128-dim face embedding from base64 image
export async function getEmbeddingFromBase64(base64Image: string): Promise<{
  embedding: number[];
  inferenceTime: number;
}> {
  try {
    const result = await TFLiteModule.getEmbeddingFromBase64(base64Image);
    return {
      embedding: result.embedding,
      inferenceTime: result.inferenceTime,
    };
  } catch (e: any) {
    console.error('Embedding error:', e);
    throw e;
  }
}

// Compare two embeddings using cosine similarity
export async function compareFaceEmbeddings(
  embedding1: number[],
  embedding2: number[],
): Promise<number> {
  try {
    const similarity = await TFLiteModule.computeCosineSimilarity(
      embedding1,
      embedding2,
    );
    return similarity;
  } catch (e: any) {
    console.error('Similarity error:', e);
    throw e;
  }
}

// Check if similarity score means a match
export function isMatch(similarity: number): boolean {
  return similarity >= 0.65;
}