import { connectDB, updateItem } from '@/api/mongo/client';
import { getSession } from '@auth0/nextjs-auth0';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);

    const { chatId, role, content } = req.body;

    let objectId;

    try {
      objectId = new ObjectId(chatId);
    } catch (e) {
      res.status(422).json({ error: 'Not valid chatId!'});

      return;
    }

    if (
      !content
        || typeof content !== 'string'
        || (role === 'user' && content.length > 500)
        || (role === 'assistant' && content.length > 100000)) {
      res.status(422).json({ error: 'content is required and must be less then 500 symbols'});

      return;
    }

    if (role !== 'user' && role !== 'assistant') {
      res.status(422).json({ error: 'role must be either assistant or user'});

      return;
    }

    try {
      await connectDB();
    } catch (error) {
      res.status(500).json({ error: 'Connecting to the database failed!'});
      return;
    }

    try {
      const result = await updateItem('ChattyOpenAi', 'chats', {
        _id: objectId,
        userId: user.sub,
      }, {
        $push: {
          messages: {
            role,
            content
          }
        }
      });

      res.status(200).json({
        message: 'Success',
        chats: {
          ...result.value,
          _id: result.value._id.toString(),
        },
      })

      return;
    } catch (error) {
      res.status(500).json({ error: 'Inserting data failed in addMessageToChat 1!'});

      return;
    }
  } catch (error) {
    res.status(500).json({ error: 'Inserting data failed in addMessageToChat 2!'});
  }
}