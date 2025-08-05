import React from 'react';

export const BotIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8 text-cyan-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 7.5v-1.5m0 7.5v-1.5m0-15A9 9 0 1012 21a9 9 0 000-18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" />
    </svg>
);