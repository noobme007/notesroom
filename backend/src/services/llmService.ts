import Groq from 'groq-sdk';
import { env } from '../config/env';

const groq = new Groq({ apiKey: env.groqApiKey });

interface ChatContext {
  relevantChunks: Array<{
    content: string;
    fileName: string;
  }>;
  query: string;
  roomName?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/**
 * Generate a response using Groq's Llama 3 model.
 */
export const generateResponse = async (context: ChatContext): Promise<string> => {
  try {
    const { relevantChunks, query, roomName, history = [] } = context;

    // Build context from relevant chunks
    const contextText = relevantChunks
      .map((chunk, i) => `[Source: ${chunk.fileName}]\n${chunk.content}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are StudyRoom AI, a helpful study assistant for the room "${roomName || 'Study Room'}". 
Your job is to help students find and understand their notes.

Guidelines:
- Answer questions based on the provided context from uploaded documents.
- If the context contains relevant information, use it to give a detailed answer.
- If asked for specific notes or files, mention the file names.
- If the context doesn't contain enough information, say so honestly.
- Be concise, clear, and educational.
- Use markdown formatting for better readability.
- When referencing content, mention which file it came from.`;

    const userInstructions = contextText
      ? `Context from uploaded documents:\n\n${contextText}\n\n---\n\nPlease answer the user's question using the context above.`
      : `No relevant documents found for this query. Please answer based on general knowledge if possible, but prioritize context if it were available.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: `${userInstructions}\n\nUser Question: ${query}` },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9,
    });

    return completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
  } catch (error: any) {
    console.error('LLM service error:', error.message);

    if (error.message?.includes('api_key')) {
      return 'The AI service is not configured. Please set up the Groq API key.';
    }

    return 'I encountered an error generating a response. Please try again later.';
  }
};

/**
 * Determine if a query is asking for specific files/notes or a conceptual question.
 */
export const classifyQuery = (query: string): 'file_search' | 'conceptual' => {
  const fileKeywords = [
    'find', 'show', 'give me', 'get', 'where is', 'download',
    'notes', 'file', 'document', 'pdf', 'slides', 'presentation',
    'unit', 'chapter', 'module', 'lecture',
  ];

  const lowerQuery = query.toLowerCase();
  const isFileSearch = fileKeywords.some((kw) => lowerQuery.includes(kw));

  return isFileSearch ? 'file_search' : 'conceptual';
};
