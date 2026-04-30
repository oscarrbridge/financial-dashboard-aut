import "./ui.css"

type ButtonProps = {
  buttonText: string;
};

export function Button({ buttonText }: ButtonProps) {
  return (
    <button className="custom-button">
      {buttonText}
    </button>
  );
}



type InputProps = {
  placeholder: string;
};

export function Input({ placeholder }: InputProps) {
  return (
    <input className="custom-input" type="text" placeholder={placeholder} />
  );
}
