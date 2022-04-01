function ImageContainer(props) {
  return (
    <div className="uk-background-fixed uk-background-center-center uk-background-norepeat uk-panel uk-flex uk-flex-center uk-flex-middle image-container">
      {props.children}
      <style jsx>
        {`
          .image-container {
            background-image: linear-gradient(
                rgba(0, 0, 0, 0.6),
                rgba(0, 0, 0, 0.6)
              ),
              url(${props.url});
            background-size: cover;
            height: 100vh;
            width: 100vw;
          }
        `}
      </style>
    </div>
  );
}

export default ImageContainer;
