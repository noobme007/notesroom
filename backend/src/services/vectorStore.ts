import { TextChunk } from '../models';
import mongoose from 'mongoose';

interface SearchResult {
  content: string;
  fileName: string;
  fileId: string;
  score: number;
  chunkIndex: number;
}

/**
 * Search for relevant text chunks in a room using text search.
 * Uses MongoDB text search and keyword matching.
 */
export const searchChunks = async (
  roomId: string,
  query: string,
  topK: number = 5
): Promise<SearchResult[]> => {
  try {
    const roomObjectId = new mongoose.Types.ObjectId(roomId);

    // Strategy 1: Try MongoDB text search
    let chunks = await TextChunk.find(
      {
        roomId: roomObjectId,
        $text: { $search: query },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(topK)
      .lean();

    // Strategy 2: Fallback to regex-based keyword search
    if (chunks.length === 0) {
      const keywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2);

      if (keywords.length > 0) {
        const regexFilters = keywords.map((kw) => ({
          content: { $regex: kw, $options: 'i' },
        }));

        chunks = await TextChunk.find({
          roomId: roomObjectId,
          $or: [
            ...regexFilters,
            ...keywords.map((kw) => ({
              fileName: { $regex: kw, $options: 'i' },
            })),
          ],
        })
          .limit(topK * 2)
          .lean();
      }
    }

    // Score and rank results
    const scored: SearchResult[] = chunks.map((chunk: any) => ({
      content: chunk.content,
      fileName: chunk.fileName,
      fileId: chunk.fileId.toString(),
      chunkIndex: chunk.chunkIndex,
      score: chunk.score || computeKeywordScore(chunk.content, chunk.fileName, query),
    }));

    // Sort by score descending and take topK
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  } catch (error) {
    console.error('Vector search error:', error);
    // Fallback to simple search if text index doesn't exist
    return await fallbackSearch(roomId, query, topK);
  }
};

/**
 * Simple keyword scoring function.
 */
const computeKeywordScore = (
  content: string,
  fileName: string,
  query: string
): number => {
  const lowerContent = content.toLowerCase();
  const lowerFileName = fileName.toLowerCase();
  const keywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  let score = 0;
  for (const kw of keywords) {
    // Content matches
    const contentMatches = (lowerContent.match(new RegExp(kw, 'gi')) || []).length;
    score += contentMatches * 1;

    // Filename matches are worth more
    if (lowerFileName.includes(kw)) {
      score += 5;
    }
  }

  return score;
};

/**
 * Fallback search when text index is not available.
 */
const fallbackSearch = async (
  roomId: string,
  query: string,
  topK: number
): Promise<SearchResult[]> => {
  const roomObjectId = new mongoose.Types.ObjectId(roomId);
  const keywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  if (keywords.length === 0) return [];

  const orConditions = keywords.flatMap((kw) => [
    { content: { $regex: kw, $options: 'i' } },
    { fileName: { $regex: kw, $options: 'i' } },
  ]);

  const chunks = await TextChunk.find({
    roomId: roomObjectId,
    $or: orConditions,
  })
    .limit(topK * 3)
    .lean();

  const results: SearchResult[] = chunks.map((chunk: any) => ({
    content: chunk.content,
    fileName: chunk.fileName,
    fileId: chunk.fileId.toString(),
    chunkIndex: chunk.chunkIndex,
    score: computeKeywordScore(chunk.content, chunk.fileName, query),
  }));

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
};
