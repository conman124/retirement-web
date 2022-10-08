import Link from "next/link";
import { AppProps } from "next/app";
import { Provider } from "react-redux";
import "../styles/globals.scss";
import store from "../store";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <div>
        <Link href="/" passHref>
          RetireLabs
        </Link>
      </div>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
