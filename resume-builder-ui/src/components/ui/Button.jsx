
import React from 'react';
import clsx from 'clsx';

const Button = ({ children, onClick, variant = 'primary', disabled, className, icon: Icon }) => {
    const baseStyles = "flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-sky-600 text-white hover:bg-sky-700 shadow-md hover:shadow-sky-200",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
        danger: "text-red-600 hover:bg-red-50",
        ghost: "text-slate-500 hover:text-sky-600 hover:bg-sky-50"
    };

    return (
        <button onClick={onClick} disabled={disabled} className={clsx(baseStyles, variants[variant], className)}>
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </button>
    );
};

export default Button;
