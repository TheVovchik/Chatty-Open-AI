import { closeDB, connectDB, getCollectionItem } from '@/api/mongo/client';
import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);

    try {
      await connectDB();
    } catch (error) {
      res.status(500).json({ error: 'Connecting to the database failed!'});
      return;
    }

    try {
      const result = await getCollectionItem('ChattyOpenAi', 'chats', {
        userId: user.sub,
      }, {
        projection: {
          userId: 0,
          messages: 0,
        }
      });

      res.status(200).json({
        message: 'Success',
        chats: result,
      })
      return;
    } catch (error) {
      res.status(500).json({ error: 'Fetching data failed!'});
      return;
    }
  } catch (error) {
    res.status(500).json({ error: 'Fetching data failed!'});
  }

  closeDB();
}