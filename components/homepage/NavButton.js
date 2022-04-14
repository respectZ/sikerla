export default function NavButton(props) {
  return (
    <li className="uk-active">
      <a href={props.href}>
        <div className="uk-text-center">
          {props.src ? (
            <img
              className="uk-border-circle"
              width="40"
              height="40"
              src={props.src}
            />
          ) : (
            <span
              className="uk-icon"
              uk-icon={`icon: ${[props.icon]}; ratio: 2`}
            ></span>
          )}

          <div className="uk-navbar-subtitle">{props.subtitle}</div>
        </div>
      </a>
    </li>
  );
}
