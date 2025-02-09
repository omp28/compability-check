import "../styles/globals.css";
import { useEffect } from "react";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import Script from "next/script";
import * as gtag from "../lib/gtag";
import MobileOnlyWrapper from "@/components/MobileOnlyWrapper";
import { DefaultSeo } from "next-seo";
import Head from "next/head";

const SEOConfig = {
  defaultTitle: "Who Knows Better? - Valentine's Day Couples Quiz Game",
  titleTemplate: "%s | Who Knows Better?",
  description:
    "Test your relationship knowledge with our fun interactive couples quiz game! Perfect for Valentine's Day, date nights, and relationship milestones.",
  canonical: "https://who-knows-better.fun",
  additionalMetaTags: [
    {
      name: "keywords",
      content:
        "couples quiz, relationship game, valentine quiz, date night games, couple games, relationship test",
    },
    {
      name: "author",
      content: "Who Knows Better",
    },
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://who-knows-better.fun",
    siteName: "Who Knows Better?",
    images: [
      {
        url: "https://who-knows-better.fun/og-image.png",
        width: 1200,
        height: 630,
        alt: "Who Knows Better - Couples Quiz Game",
      },
    ],
  },
  twitter: {
    cardType: "summary_large_image",
    site: "@whoknowsbetter",
  },
};

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="theme-color" content="#ff69b4" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>

      <DefaultSeo {...SEOConfig} />

      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>

      <MobileOnlyWrapper>
        <Component {...pageProps} />
      </MobileOnlyWrapper>
    </>
  );
}

export default MyApp;
