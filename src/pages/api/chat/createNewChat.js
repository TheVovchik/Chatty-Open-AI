import { closeDB, connectDB, insertDoc } from '@/api/mongo/client';
import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.length > 500) {
      res.status(422).json({ error: 'message is required and must be less then 500 symbols'});

      return;
    }

    const newUserMessage = {
      role: 'user',
      content: message,
    }

    try {
      await connectDB();
    } catch (error) {
      res.status(500).json({ error: 'Connecting to the database failed!'});
      return;
    }

    try {
      const result = await insertDoc('ChattyOpenAi', 'chats', {
        userId: user.sub,
        messages: [newUserMessage],
        title: message,
      });

      res.status(200).json({
        message: 'Success',
        id: result.insertedId.toString(),
        messages: [newUserMessage],
      })

      return;
    } catch (error) {
      res.status(500).json({ error: 'Inserting data failed!'});

      return;
    }
  } catch (error) {
    res.status(500).json({ error: 'Inserting data failed!'});
  }

  closeDB();
}