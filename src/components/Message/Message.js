import { useUser } from '@auth0/nextjs-auth0/client';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import React from 'react'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

export const Message = ({ message }) => {
  const { role, content } = message;
  const isUser = role === 'user';
  const isNotice = role === 'notice';
  const { user } = useUser();

  return (
    <div className={`grid grid-cols-[30px_1fr] gap-5 p-5 ${isNotice ? 'bg-red-600' : !isUser ? 'bg-gray-600' : ''}`}>
      <div className="w-[30px] h-[30px]">
        {
          isUser
            ? (
              <Image src={user?.picture ?? '/user.png'} width={30} height={30} alt="user avatart" className="rounded-sm shadow-md shadow-black/50" />
            )
            : isNotice ? null
              : (
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-sm shadow-md shadow-black/50 bg-gray-800">
                    <FontAwesomeIcon icon={faRobot} className="text-emerald-300"/>
                  </div>
                )
        }
      </div>
      <div className="prose prose-invert">
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
