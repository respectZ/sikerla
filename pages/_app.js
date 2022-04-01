import { useEffect } from "react";
import UIkit from "uikit";
import "uikit/dist/css/uikit.min.css";

import Icons from "uikit/dist/js/uikit-icons";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    UIkit.use(Icons);
  });
  return <Component {...pageProps} />;
}

export default MyApp;
