import '@/styles/globals.css'
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Head from 'next/head';
import React from 'react';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { Outfit } from 'next/font/google' 

config.autoAddCss = false;

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Head>
        <link rel="icon" href="/favicon.png"/>
      </Head>
      
      <main className={`${outfit.variable} font-body`}>
        <Component {...pageProps} />
      </main>
    </UserProvider>
  );
};
