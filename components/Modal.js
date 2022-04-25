import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

let ModalPortal = (props) => {
  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
  }, []);
  if (!isSSR) {
    const modalRoot = document.createElement("div");
    modalRoot.setAttribute("uk-modal", "bg-close: false");
    modalRoot.id = "modal-produk";
    // useEffect(() => {
    //   document.body.appendChild(modalRoot);
    //   return () => {
    //     document.body.removeChild(modalRoot);
    //   };
    // });
    return ReactDOM.createPortal(props.children, modalRoot);
  }
};

export default ModalPortal;
