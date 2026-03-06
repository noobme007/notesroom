import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { TextChunk } from '../models';
import mongoose from 'mongoose';

const CHUNK_SIZE = 500; // characters per chunk
const CHUNK_OVERLAP = 50; // overlap between chunks

/**
 * Extract text from a file buffer based on its MIME type.
 */
export const extractText = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  try {
    switch (mimeType) {
      case 'application/pdf':
        return await extractPdfText(buffer);

      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractDocText(buffer);

      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        // PPT text extraction is limited — store filename as reference
        return '[PowerPoint presentation — content available for preview]';

      default:
        if (mimeType.startsWith('image/')) {
          return '[Image file — content available for preview]';
        }
        return '';
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    return '';
  }
};

/**
 * Extract text from a PDF buffer.
 */
const extractPdfText = async (buffer: Buffer): Promise<string> => {
  const data = await pdfParse(buffer);
  return data.text;
};

/**
 * Extract text from a Word document buffer.
 */
const extractDocText = async (buffer: Buffer): Promise<string> => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

/**
 * Split text into overlapping chunks.
 */
export const splitIntoChunks = (text: string): string[] => {
  if (!text || text.length === 0) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
};

/**
 * Process a file: extract text, split into chunks, and store in DB.
 */
export const processDocument = async (
  fileBuffer: Buffer,
  mimeType: string,
  fileId: string,
  roomId: string,
  fileName: string
): Promise<void> => {
  try {
    // Extract text
    const text = await extractText(fileBuffer, mimeType);

    if (!text || text.length === 0) {
      console.log(`No text extracted from file: ${fileName}`);
      return;
    }

    // Split into chunks
    const chunks = splitIntoChunks(text);

    // Delete existing chunks for this file (in case of re-processing)
    await TextChunk.deleteMany({ fileId: new mongoose.Types.ObjectId(fileId) });

    // Store chunks
    const chunkDocs = chunks.map((content, index) => ({
      fileId: new mongoose.Types.ObjectId(fileId),
      roomId: new mongoose.Types.ObjectId(roomId),
      content,
      chunkIndex: index,
      fileName,
    }));

    if (chunkDocs.length > 0) {
      await TextChunk.insertMany(chunkDocs);
    }

    console.log(`✅ Processed ${fileName}: ${chunkDocs.length} chunks stored`);
  } catch (error) {
    console.error(`Error processing document ${fileName}:`, error);
  }
};
