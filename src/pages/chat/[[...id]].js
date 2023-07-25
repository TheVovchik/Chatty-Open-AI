import ChatSidebar from '@/components/ChatSidebar/ChatSidebar';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { streamReader } from 'openai-edge-stream';
import { v4 as uuid } from 'uuid';
import { Message } from '@/components/Message';
import { useRouter } from 'next/router';
import { getSession } from '@auth0/nextjs-auth0';
import { ObjectId } from 'mongodb';
import { connectDB, getCollectionItem } from '@/api/mongo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

export default function Chat({ id, messages = [] }) {
  const [chatId, setChatId] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [fullResponse, setFullResponse] = useState('');
  const [originalChatId, setOriginalChatId] = useState(id);
  const router = useRouter();

  const visibleMessages = [...messages, ...chatMessages];

  const isRouteWasChanged = id !== originalChatId;

  useEffect(() => {
    if (!generating && chatId) {
      setChatId(null);
      router.push(`/chat/${chatId}`);
    }
  }, [chatId, generating, router])

  useEffect(() => {
    if (!generating && fullResponse && !isRouteWasChanged) {
      setChatMessages(prev => [...prev, {
        _id: uuid(),
        role: 'assistant',
        content: fullResponse,
      }])
    }
  }, [generating, fullResponse, isRouteWasChanged])

  const handleMessageInput = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setOriginalChatId(id);
    setFullResponse('');
    setChatMessages(prev => {
      const newChatMessages = [...prev, {
        _id: uuid(),
        role: 'user',
        content: message
      }]

      return newChatMessages;
    });
    setMessage('');

    const response = await fetch('/api/chat/sendMessage', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ message, id }),
    });


    const data = response.body;

    if (!data) {
      return;
    }

    const reader = data.getReader();
    let content = '';
    await streamReader(reader, (message) => {
      if (message.event === 'newChatId') {
        setChatId(message.content);
      } else {
        setIncomingMessage(curr => curr + message.content);
        content = content + message.content;
      }
    });

    setFullResponse(content);
    setIncomingMessage('');
    setGenerating(false);
  };

  useEffect(() => {
    setChatId(null);
    setChatMessages([]);
  }, [id]);

  return (
    <>
      <Head>
        <title>New Chat</title>
      </Head>

      <main
        className="grid h-screen grid-cols-[260px_1fr]"
      >
        <ChatSidebar chatId={id} />

        <div className="bg-gray-700 flex flex-col overflow-hidden">
          <div className="chat-body flex-1 flex flex-col-reverse text-white overflow-y-auto">
            {visibleMessages.length === 0
            ? (
              <div className="m-auto justify-center items-center flex text-center">
                <div>
                  <FontAwesomeIcon
                    icon={faRobot}
                    className="text-6xl text-emerald-200 mb-2"
                  />
                  <h1
                    className="text-4xl font-bold text-white/50"
                  >
                    Ask me a question!
                  </h1>
                </div>
              </div>
            )
            : (
                <div className="mb-auto">
                  {visibleMessages.map(message => {
                    return <Message key={message._id} message={message} />
                  })}

                  {incomingMessage && !isRouteWasChanged && <Message message={{ role: 'assistant', content: incomingMessage }} />}
                  {incomingMessage && isRouteWasChanged && <Message message={{ role: 'notice', content: 'Only one message at a time. Please allow any other responses to complete before sending another message' }} />}
                </div>
              )
            }
          </div>

          <div className="bg-gray-800 p-10">
            <form onSubmit={handleSubmit}>
              <fieldset
                className="flex gap-2"
                disabled={generating}
              >
                <textarea
                  className="w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-500 focus:outline focus:outline-emerald-500"
                  placeholder={generating ? '' : 'Send a message...'}
                  value={message}
                  onChange={handleMessageInput}
                />
                <button
                  className="btn"
                  type="submit"
                >
                  Send
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps = async (ctx) => {
  const id = ctx.params?.id?.[0] || null;

  if (id) {
    const { user } = await getSession(ctx.req, ctx.res);

    let objectId;

    try {
      objectId = new ObjectId(id);
    } catch (e) {
      return {
        redirect: {
          destination: '/chat',
        }
      }
    }


    try {
      await connectDB();
      const result = await getCollectionItem('ChattyOpenAi', 'chats', {
        userId: user.sub,
        _id: objectId
      });

      if (result.length === 0) {
        return {
          redirect: {
            destination: '/chat',
          }
        }
      }

      return {
        props: {
          id,
          messages: result[0].messages.map(message => ({
            ...message,
            _id: uuid(),
          }))
        }
      }
    } catch (error) {
      return {
        props: {
          id,
        }
      }
    }
  }

  return {
    props: {
      id,
    }
  }
}
