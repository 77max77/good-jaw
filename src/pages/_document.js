import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* PWA 아이콘 */}
        <link rel="icon" href="/icons/logo.png" />
        <link rel="apple-touch-icon" href="/icons/logo.png" />

        {/* PWA 기본 설정 */}
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />

        {/* iOS 관련 설정 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="굿턱" />

        {/* Android 관련 설정 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="굿턱" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
