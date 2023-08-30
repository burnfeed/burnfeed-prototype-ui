import Head from "next/head";
import Script from 'next/script'
import Link from 'next/link'
import NavBar from "../components/NavBar"
import ActionsManager from "../provider/ActionsManager";


interface ILayoutProps {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Layout({title, children,
  ...props
}: ILayoutProps) {
  return (
    <>
      <Head>
        <title>Burnfeed - A Decentralized Twitter-Like DApp</title>
        <meta
          content="Burnfeed - A Decentralized Twitter-Like DApp"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <main>
        <NavBar />
        <div className="m-auto w-full max-w-3xl">
          {children}
        </div>
      </main>
    </>
  );
}
