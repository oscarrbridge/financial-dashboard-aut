import React from "react";
import "./ui.css"

type ButtonProps = {
  buttonText: string;
  onClick?: () => void;
};

export function Button({ buttonText, onClick }: ButtonProps) {
  return (
    <button className="custom-button" type="button" onClick={onClick}>
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

type WrapperProps = {
  children: React.ReactNode;
  className?: string;
};

export function Wrapper({ children, className = ""}: WrapperProps) {
  return (
    <div className={`custom-wrapper ${className}`}>
      {children}
    </div>
  );
}
