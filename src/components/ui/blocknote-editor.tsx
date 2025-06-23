'use client';

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';

interface TinyMCEEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function BlockNoteEditorComponent({ value, onChange, placeholder, className }: TinyMCEEditorProps) {
    const editorRef = useRef<TinyMCEEditor | null>(null);

    const handleEditorChange = (content: string) => {
        onChange(content);
    };

    return (
        <div className={`tinymce-editor-container ${className || ''}`}>
            <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                onInit={(evt, editor) => editorRef.current = editor}
                value={value}
                onEditorChange={handleEditorChange}
                init={{
                    height: 500,
                    menubar: false,
                    skin: 'oxide-dark',
                    content_css: 'dark',
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount', 'paste'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor backcolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | table | code | help',
                    table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
                    table_appearance_options: false,
                    table_grid: false,
                    table_class_list: [
                        { title: 'Default', value: '' },
                        { title: 'Striped', value: 'table-striped' },
                        { title: 'Bordered', value: 'table-bordered' }
                    ],
                    content_style: `
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                            font-size: 14px;
                            background-color: #1f2937;
                            color: #f9fafb;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 1em 0;
                            border: 1px solid #374151;
                        }
                        table td, table th {
                            border: 1px solid #374151;
                            padding: 8px 12px;
                            text-align: left;
                        }
                        table th {
                            background-color: #374151;
                            font-weight: bold;
                        }
                        table tr:nth-child(even) {
                            background-color: #1f2937;
                        }
                        table tr:nth-child(odd) {
                            background-color: #111827;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            color: #f9fafb;
                        }
                        p {
                            color: #f9fafb;
                        }
                        ul, ol {
                            color: #f9fafb;
                        }
                        li {
                            color: #f9fafb;
                        }
                    `,
                    paste_data_images: true,
                    paste_as_text: false,
                    paste_auto_cleanup_on_paste: true,
                    paste_remove_styles: false,
                    paste_remove_styles_if_webkit: false,
                    paste_strip_class_attributes: 'none',
                    placeholder: placeholder || 'Start typing or paste your content here...',
                    resize: false,
                    branding: false,
                    promotion: false
                }}
            />
        </div>
    );
} 