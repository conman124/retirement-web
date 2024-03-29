import { Navbar } from "react-daisyui";
import Link from "next/link";
import { AppProps } from "next/app";
import { Provider } from "react-redux";
import "../styles/globals.css";
import store from "../store/index.js";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <Head>
                <title>RetireLabs</title>
            </Head>
            <Navbar className="bg-primary shadow-lg">
                <Navbar.Start className="hidden md:flex"></Navbar.Start>
                <Navbar.Center>
                    <Link href="/">
                        <a className="btn text-primary-content btn-ghost normal-case text-xl">
                            <img src="icon.svg" className="h-full pr-3" />
                            RetireLabs
                        </a>
                    </Link>
                    <Link href="/calculator">
                        <a className="pl-4 pr-4 text-primary-content text-xl">
                            Calculator
                        </a>
                    </Link>
                </Navbar.Center>
                <Navbar.End className="hidden md:flex"></Navbar.End>
            </Navbar>
            <Component {...pageProps} />
        </Provider>
    );
}

export default MyApp;
