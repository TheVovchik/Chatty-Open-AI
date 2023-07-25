import { faMessage, faPlus, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function ChatSidebar({ chatId }) {
  const [chatList, setChatList] = useState([]);

  const loadChatList = async () => {
    try {
      const result = await fetch('/api/chat/getChatList', {
        method: 'POST',
      })
      const json = await result.json();

      setChatList(json.chats || []);
    } catch (error) {
      console.log('fetching chat list error: ', error);
    }
  };

  useEffect(() => {
    loadChatList();
  }, [chatId]);

  return (
    <div
      className="bg-gray-900 text-white flex flex-col overflow-hidden"
    >
      <Link
        className="side-menu-item bg-emerald-500 hover:bg-emerald-600"
        href='/chat'
      >
        <FontAwesomeIcon icon={faPlus} />
        New Chat
      </Link>

      <div className="flex-1 overflow-y-auto bg-gray-950">
        {chatList.map(chat => {
          const isActive = chat._id === chatId;

          return (
            <Link className={`side-menu-item ${isActive ? 'bg-gray-700 hover:bg-gray-700' : ''}`} key={chat._id} href={`/chat/${chat._id}`}>
              <FontAwesomeIcon icon={faMessage} className="text-white/50"/>
              <span
                title={chat.title}
                className="overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {chat.title}
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        className="side-menu-item"
        href='/api/auth/logout'
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
        Logout
      </Link>
    </div>
  )
}
