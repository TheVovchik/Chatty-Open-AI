import { OpenAIEdgeStream } from 'openai-edge-stream';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { message, id } = await req.json();

    // validating message
    if (typeof message !== 'string' || message.length > 500) {
      return new Response({
        message: 'message is required and must be less then 500 symbols'
      }, { status: 422 })
    }

    const initialMessage = {
      role: 'system',
      content: 'Your name is Chatty Open AI. An incredible intelligent and quick-thinking AI, that always replies witn an enthusiastic and positive energy. You were created by Volodymyr Nosachenko. Your response must be formatted as markdown.'
    }

    let chatId = id;
    let newChatId;
    let chatMessages = [];

    if (id) { 
      const response = await fetch(`${req.headers.get('origin')}/api/chat/addMessageToChat`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: req.headers.get('cookie'),
        },
        body: JSON.stringify({
          chatId,
          role: 'user',
          content: message,
        }),
      })
      
      const json = await response.json();

      chatMessages = json.chats.messages || [];
    } else {
      const result = await fetch(`${req.headers.get('origin')}/api/chat/createNewChat`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: req.headers.get('cookie'),
        },
        body: JSON.stringify({
          message,
        }),
      });

      const json = await result.json();
      chatId = json.id;
      newChatId = json.id;
      chatMessages = json.messages || [];
    }

    const messageToInclude = [];
    chatMessages.reverse();
    let usedTokens = 0;

    for (let chatMessage of chatMessages) {
      const messagesTokens = chatMessage.content.length / 4;

      usedTokens += messagesTokens;

      if (usedTokens <= 2000) {
        messageToInclude.push(chatMessage);
      } else {
        break;
      }
    }

    messageToInclude.reverse();

    const stream = await OpenAIEdgeStream('https://api.openai.com/v1/chat/completions', {
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.OPEN_AI_SECRET_KEY}`
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [initialMessage, ...messageToInclude],
        stream: true,
      })
    }, {
      onBeforeStream: (({ emit }) => {
        if (newChatId) {
          emit(newChatId, "newChatId");
        }
      }),
      onAfterStream: async ({ fullContent }) => {
        await fetch(`${req.headers.get('origin')}/api/chat/addMessageToChat`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            cookie: req.headers.get('cookie'),
          },
          body: JSON.stringify({
            chatId,
            role: 'assistant',
            content: fullContent,
          }),
        })
      }
    })

    return new Response(stream);
  } catch (error) {
    return new Response({
      message: 'An error occured in sendMessage'
    }, { status: 500 })
  }
}