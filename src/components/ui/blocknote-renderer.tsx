'use client';

import React from 'react';

interface TinyMCERendererProps {
    content: string;
    className?: string;
}

export function BlockNoteRenderer({ content, className }: TinyMCERendererProps) {
    if (!content || content.trim() === '') {
        return (
            <div className={`text-gray-400 italic ${className || ''}`}>
                No content available
            </div>
        );
    }

    return (
        <div
            className={`rich-text-content ${className || ''}`}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
} 