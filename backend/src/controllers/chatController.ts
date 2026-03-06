import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ChatMessage, File, Room } from '../models';
import { searchChunks } from '../services/vectorStore';
import { generateResponse, classifyQuery } from '../services/llmService';

/**
 * POST /api/rooms/:roomId/chat
 * Send a chat message and get AI response.
 */
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;
    const userId = req.user!._id;

    if (!message || message.trim().length === 0) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    // Classify the query
    const queryType = classifyQuery(message);

    // Search for relevant chunks
    const relevantChunks = await searchChunks(roomId, message, 5);

    // Find referenced files
    const uniqueFileIds = [...new Set(relevantChunks.map((c) => c.fileId))];
    const referencedFiles = await File.find({
      _id: { $in: uniqueFileIds },
    }).select('fileName fileUrl');

    const fileReferences = referencedFiles.map((f) => ({
      fileId: f._id,
      fileName: f.fileName,
      fileUrl: f.fileUrl,
    }));

    let aiResponse: string;

    if (queryType === 'file_search' && referencedFiles.length > 0) {
      // For file searches, include file list in response
      const fileList = referencedFiles
        .map((f) => `📄 **${f.fileName}**`)
        .join('\n');

      const contextChunks = relevantChunks.map((c) => ({
        content: c.content,
        fileName: c.fileName,
      }));

      const llmResponse = await generateResponse({
        relevantChunks: contextChunks,
        query: message,
        roomName: room.roomName,
      });

      aiResponse = `Found relevant documents:\n\n${fileList}\n\n---\n\n${llmResponse}`;
    } else {
      // For conceptual questions
      const contextChunks = relevantChunks.map((c) => ({
        content: c.content,
        fileName: c.fileName,
      }));

      aiResponse = await generateResponse({
        relevantChunks: contextChunks,
        query: message,
        roomName: room.roomName,
      });
    }

    // Save chat message
    const chatMessage = await ChatMessage.create({
      roomId,
      userId,
      message,
      response: aiResponse,
      fileReferences,
    });

    res.json({
      chatMessage: {
        _id: chatMessage._id,
        message: chatMessage.message,
        response: chatMessage.response,
        fileReferences: chatMessage.fileReferences,
        createdAt: chatMessage.createdAt,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

/**
 * GET /api/rooms/:roomId/chat/history
 * Get chat history for a room.
 */
export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ roomId })
      .populate('userId', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ChatMessage.countDocuments({ roomId });

    res.json({
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};
