'use client';

import React from "react";
import { useState } from "react";
import "./ui.css"

type ButtonProps = {
  buttonText: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export function Button({ buttonText, onClick, type }: ButtonProps) {
  return (
    <button className="custom-button" onClick={onClick} type={type}>
      {buttonText}
    </button>
  );
}



type InputProps = {
  placeholder: string;
  value?: string;
  onChange?: (selected: string) => void;
};

export function Input({ placeholder, value, onChange }: InputProps) {
  return (
    <input 
    className="custom-input" 
    type="text" 
    placeholder={placeholder} 
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    />
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

type MultiSelectProps = {
  options: string[];
  onChange?: (selected: string) => void;
}

export function MultiSelect({ options, onChange }: MultiSelectProps) {

  const [selected, setSelected] = useState<string>(options[0]);


  const select = (option: string) => {
    setSelected(option);
    onChange?.(option);
  };

  return (
    <div className="custom-multi-select">
      {options.map((option, index) => (
        <span 
        className={`multi-select-option ${selected === option ? "active" : ""}`}
        key={index} 
        onClick={() => select(option)}>
          {option}
        </span>
      ))}
    </div>
  );
}
