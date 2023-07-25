import Head from 'next/head';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import React from 'react';
import { getSession } from '@auth0/nextjs-auth0';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const { isLoading, error, user } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <>{error.message}</>;
  return (
    <>
      <Head>
        <title>Chatty OpenAI - Login or Signup</title>
      </Head>

      <div
        className='flex justify-center items-center min-h-screen w-full bg-gray-800 text-white text-center'
      >
        <div>
          <div>
            <FontAwesomeIcon
              icon={faRobot}
              className="text-6xl text-emerald-200 mb-2"
            />
          </div>

          <h1
            className="text-4xl font-bold mb-2"
          >
            Welcome to Chatty Open AI
          </h1>

          <p
            className="text-lg mb-4"
          >
            Log in with your account to continue
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              className="btn"
              href='/api/auth/login'
            >
              Login
            </Link>

            <Link
              className="btn"
              href='/api/auth/signup'
            >
              Signup
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req, ctx.res);

  if (session) {
    return {
      redirect: {
        destination: 'chat',
      }
    }
  }

  return {
    props: {}
  }
}
