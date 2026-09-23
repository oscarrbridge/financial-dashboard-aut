"use client";

import React from "react";
import { useState } from "react";
import "./ui.css";
import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Dot } from "lucide-react";

type ButtonProps = {
	buttonText?: string;
	onClick?: () => void;
	type?: "button" | "submit" | "reset";
	children?: React.ReactNode;
	width?: number;
};

export function Button({
	buttonText,
	onClick,
	type,
	children,
	width,
}: ButtonProps) {
	return (
		<button
			className="custom-button"
			style={{ minWidth: width }}
			onClick={onClick}
			type={type}
		>
			{children ?? buttonText}
		</button>
	);
}

type InputProps = {
	placeholder?: string;
	value?: string;
	onChange?: (selected: string) => void;
	type?: "text" | "password";
	autoComplete?: string;
	name?: string;
	id?: string;
	maxLength?: number;
};

export function Input({
	placeholder,
	value,
	onChange,
	type,
	autoComplete,
	name,
	id,
	maxLength,
}: InputProps) {
	return (
		<input
			className="custom-input"
			type={type}
			placeholder={placeholder}
			value={value}
			onChange={(e) => onChange?.(e.target.value)}
			autoComplete={autoComplete}
			name={name}
			id={id}
			maxLength={maxLength}
		/>
	);
}

type WrapperProps = {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
};

export function Wrapper({
	children,
	className = "",
	style,
}: WrapperProps) {
	return (
		<div
			className={`custom-wrapper ${className}`}
			style={style}
		>
			{children}
		</div>
	);
}

type MultiSelectProps = {
	options: string[];
	onChange?: (selected: string) => void;
};

export function MultiSelect({
	options,
	onChange,
}: MultiSelectProps) {
	const [selected, setSelected] = useState<string>(options[0]);

	const select = (option: string) => {
		setSelected(option);
		onChange?.(option);
	};

	return (
		<div className="custom-multi-select">
			{options.map((option, index) => (
				<span
					className={`multi-select-option ${
						selected === option ? "active" : ""
					}`}
					key={index}
					onClick={() => select(option)}
				>
					{option}
				</span>
			))}
		</div>
	);
}

type NavIconProps = {
	icon: LucideIcon;
	text: string;
	link?: string;
	active?: boolean;
	onClick?: () => void;
};

export function NavIcon({
	icon: Icon,
	text,
	link = "/",
	active,
	onClick,
}: NavIconProps) {
	const isTransactions = text === "Transactions";

	return (
		<Link
			href={link}
			className={`custom-nav-icon relative flex flex-col items-center justify-center text-center ${active}`}
			onClick={onClick}
		>
			<Icon className="shrink-0" />

			<span
				className="w-full text-center leading-tight"
				style={{
					transform: isTransactions
						? "translateX(-5px)"
						: undefined,
				}}
			>
				{text}
			</span>

			{active && (
				<Dot className="active-dot absolute bottom-0" />
			)}
		</Link>
	);
}

type dropDownProps = {
	options: string[];
	onChange?: (selected: string) => void;
	value?: string;
};

export function DropDown({
	options,
	onChange,
	value,
}: dropDownProps) {
	return (
		<select
			value={value}
			onChange={(e) => onChange?.(e.target.value)}
		>
			{options.map((option, index) => (
				<option key={index} value={option}>
					{option}
				</option>
			))}
		</select>
	);
}

type InfoTooltipProps = {
	text: string;
};

export function InfoTooltip({
	text,
}: InfoTooltipProps) {
	return (
		<div className="info-tooltip">
			<span className="info-tooltip-icon">?</span>
			<span className="info-tooltip-text">
				{text}
			</span>
		</div>
	);
}

type NoDataProps = {
	height?: number;
};

export function NoData({
	height = 320,
}: NoDataProps) {
	return (
		<div
			className="no-data"
			style={{ height }}
		>
			No data available
		</div>
	);
}