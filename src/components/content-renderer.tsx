'use client';

import React from 'react';
import { Content } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlockNoteRenderer } from '@/components/ui/blocknote-renderer';

interface ContentRendererProps {
    content: Content;
    className?: string;
}

export function ContentRenderer({ content, className = '' }: ContentRendererProps) {
    // First, try to parse as JSON to handle legacy data
    let parsedContent;
    try {
        parsedContent = JSON.parse(content.content);

        // Check if this is legacy BlockNote/Editor.js data format (array of blocks)
        if (Array.isArray(parsedContent) || (parsedContent.blocks && Array.isArray(parsedContent.blocks))) {
            // For legacy data, show a message that it needs to be re-edited
            return (
                <div className={className}>
                    <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-4">
                        <p className="text-yellow-200 text-sm">
                            This content was created with an older editor. Please re-edit this content to view it properly.
                        </p>
                    </div>
                    <BlockNoteRenderer content="<p>Legacy content format - please re-edit</p>" />
                </div>
            );
        }
    } catch {
        // If it's not JSON, treat it as HTML from TinyMCE
        // Check if the content looks like it contains HTML tags
        const hasHTMLTags = /<[^>]*>/g.test(content.content);

        if (!hasHTMLTags) {
            // If no HTML tags, treat as plain text
            return (
                <div className={`${className}`}>
                    <BlockNoteRenderer content={`<p>${content.content}</p>`} />
                </div>
            );
        }

        // Render HTML content directly
        return (
            <div className={`${className}`}>
                <BlockNoteRenderer content={content.content} />
                <style jsx>{`
                    .rich-text-content {
                        color: #f9fafb;
                        line-height: 1.6;
                    }
                    
                    .rich-text-content h1 {
                        font-size: 2.5rem !important;
                        font-weight: 800 !important;
                        color: #ffffff !important;
                        margin: 2rem 0 1.5rem 0 !important;
                        border-bottom: 3px solid #8b5cf6 !important;
                        padding-bottom: 0.75rem !important;
                    }
                    
                    .rich-text-content h2 {
                        font-size: 1.875rem !important;
                        font-weight: 700 !important;
                        color: #ffffff !important;
                        margin: 2rem 0 1rem 0 !important;
                        border-bottom: 2px solid #6b7280 !important;
                        padding-bottom: 0.5rem !important;
                    }
                    
                    .rich-text-content h3 {
                        font-size: 1.5rem !important;
                        font-weight: 600 !important;
                        color: #ffffff !important;
                        margin: 1.5rem 0 0.75rem 0 !important;
                    }
                    
                    .rich-text-content p {
                        color: #d1d5db !important;
                        margin: 1rem 0 !important;
                        line-height: 1.7 !important;
                    }
                    
                    .rich-text-content strong {
                        color: #ffffff !important;
                        font-weight: 700 !important;
                    }
                    
                    .rich-text-content table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin: 2rem 0 !important;
                        background-color: #1f2937 !important;
                        border-radius: 12px !important;
                        overflow: hidden !important;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
                    }
                    
                    .rich-text-content th {
                        background: linear-gradient(135deg, #374151, #4b5563) !important;
                        color: #ffffff !important;
                        font-weight: 700 !important;
                        padding: 1rem 1.25rem !important;
                        text-align: left !important;
                        border-bottom: 2px solid #6b7280 !important;
                        font-size: 0.95rem !important;
                        text-transform: uppercase !important;
                        letter-spacing: 0.05em !important;
                    }
                    
                    .rich-text-content td {
                        padding: 1rem 1.25rem !important;
                        border-bottom: 1px solid #374151 !important;
                        color: #e5e7eb !important;
                        vertical-align: top !important;
                        line-height: 1.6 !important;
                    }
                    
                    .rich-text-content tr:hover {
                        background-color: rgba(139, 92, 246, 0.1) !important;
                        transition: background-color 0.2s ease !important;
                    }
                    
                    .rich-text-content tr:last-child td {
                        border-bottom: none !important;
                    }
                    
                    /* Level-specific styling based on content */
                    .rich-text-content h2:contains("Level 3") + table {
                        border: 2px solid #dc2626 !important;
                        background: linear-gradient(135deg, #1f2937, #991b1b) !important;
                    }
                    
                    .rich-text-content h2:contains("Level 2") + table {
                        border: 2px solid #ea580c !important;
                        background: linear-gradient(135deg, #1f2937, #9a3412) !important;
                    }
                    
                    .rich-text-content h2:contains("Level 1") + table {
                        border: 2px solid #eab308 !important;
                        background: linear-gradient(135deg, #1f2937, #a16207) !important;
                    }
                    
                    .rich-text-content h2:contains("Verbal") + table {
                        border: 2px solid #3b82f6 !important;
                        background: linear-gradient(135deg, #1f2937, #1e40af) !important;
                    }
                    
                    .rich-text-content blockquote {
                        background: linear-gradient(135deg, #374151, #4b5563) !important;
                        border-left: 4px solid #8b5cf6 !important;
                        border-radius: 0 8px 8px 0 !important;
                        padding: 1rem 1.5rem !important;
                        margin: 1.5rem 0 !important;
                        color: #f3f4f6 !important;
                        font-weight: 600 !important;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                    }
                    
                    .rich-text-content ul {
                        list-style-type: disc !important;
                        padding-left: 2rem !important;
                        margin: 1.5rem 0 !important;
                        color: #d1d5db !important;
                    }
                    
                    .rich-text-content li {
                        margin: 0.75rem 0 !important;
                        line-height: 1.6 !important;
                    }
                    
                    .rich-text-content li strong {
                        color: #ffffff !important;
                    }
                `}</style>
            </div>
        );
    }

    // Check if this is the new format with type and content fields
    if (parsedContent.type === 'markdown' && parsedContent.content) {
        // Check if the markdown content actually contains HTML
        const hasHTMLTags = /<[^>]*>/g.test(parsedContent.content);

        if (hasHTMLTags) {
            // If it contains HTML, render as HTML instead of markdown
            return (
                <div className={`${className}`}>
                    <div
                        className="rich-text-content"
                        dangerouslySetInnerHTML={{ __html: parsedContent.content }}
                    />
                    <style jsx>{`
                        .rich-text-content {
                            color: #f9fafb;
                            line-height: 1.6;
                        }
                        
                        .rich-text-content h1 {
                            font-size: 2.5rem !important;
                            font-weight: 800 !important;
                            color: #ffffff !important;
                            margin: 2rem 0 1.5rem 0 !important;
                            border-bottom: 3px solid #8b5cf6 !important;
                            padding-bottom: 0.75rem !important;
                        }
                        
                        .rich-text-content h2 {
                            font-size: 1.875rem !important;
                            font-weight: 700 !important;
                            color: #ffffff !important;
                            margin: 2rem 0 1rem 0 !important;
                            border-bottom: 2px solid #6b7280 !important;
                            padding-bottom: 0.5rem !important;
                        }
                        
                        .rich-text-content h3 {
                            font-size: 1.5rem !important;
                            font-weight: 600 !important;
                            color: #ffffff !important;
                            margin: 1.5rem 0 0.75rem 0 !important;
                        }
                        
                        .rich-text-content p {
                            color: #d1d5db !important;
                            margin: 1rem 0 !important;
                            line-height: 1.7 !important;
                        }
                        
                        .rich-text-content strong {
                            color: #ffffff !important;
                            font-weight: 700 !important;
                        }
                        
                        .rich-text-content table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                            margin: 2rem 0 !important;
                            background-color: #1f2937 !important;
                            border-radius: 12px !important;
                            overflow: hidden !important;
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
                        }
                        
                        .rich-text-content th {
                            background: linear-gradient(135deg, #374151, #4b5563) !important;
                            color: #ffffff !important;
                            font-weight: 700 !important;
                            padding: 1rem 1.25rem !important;
                            text-align: left !important;
                            border-bottom: 2px solid #6b7280 !important;
                            font-size: 0.95rem !important;
                            text-transform: uppercase !important;
                            letter-spacing: 0.05em !important;
                        }
                        
                        .rich-text-content td {
                            padding: 1rem 1.25rem !important;
                            border-bottom: 1px solid #374151 !important;
                            color: #e5e7eb !important;
                            vertical-align: top !important;
                            line-height: 1.6 !important;
                        }
                        
                        .rich-text-content tr:hover {
                            background-color: rgba(139, 92, 246, 0.1) !important;
                            transition: background-color 0.2s ease !important;
                        }
                        
                        .rich-text-content tr:last-child td {
                            border-bottom: none !important;
                        }
                        
                        .rich-text-content blockquote {
                            background: linear-gradient(135deg, #374151, #4b5563) !important;
                            border-left: 4px solid #8b5cf6 !important;
                            border-radius: 0 8px 8px 0 !important;
                            padding: 1rem 1.5rem !important;
                            margin: 1.5rem 0 !important;
                            color: #f3f4f6 !important;
                            font-weight: 600 !important;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                        }
                        
                        .rich-text-content ul {
                            list-style-type: disc !important;
                            padding-left: 2rem !important;
                            margin: 1.5rem 0 !important;
                            color: #d1d5db !important;
                        }
                        
                        .rich-text-content li {
                            margin: 0.75rem 0 !important;
                            line-height: 1.6 !important;
                        }
                        
                        .rich-text-content li strong {
                            color: #ffffff !important;
                        }
                    `}</style>
                </div>
            );
        }

        // Otherwise render as actual markdown
        return (
            <div className={className}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        table: ({ ...props }) => (
                            <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/70 my-6 shadow-lg">
                                <table
                                    className="min-w-full text-sm text-left text-gray-300"
                                    {...props}
                                />
                            </div>
                        ),
                        thead: ({ ...props }) => (
                            <thead className="bg-gradient-to-r from-purple-900/60 to-violet-900/60">
                                {props.children}
                            </thead>
                        ),
                        th: ({ ...props }) => (
                            <th
                                className="px-3 py-2 font-semibold text-white border-b border-gray-800"
                                {...props}
                            />
                        ),
                        tr: ({ ...props }) => (
                            <tr className="hover:bg-purple-900/10 transition-colors">{props.children}</tr>
                        ),
                        td: ({ ...props }) => (
                            <td
                                className="px-3 py-2 border-b border-gray-800"
                                {...props}
                            />
                        ),
                    }}
                >
                    {parsedContent.content}
                </ReactMarkdown>
            </div>
        );
    }

    // Otherwise, render as the old structured format
    return (
        <div className={`prose prose-invert max-w-none ${className}`}>
            <RenderNode node={parsedContent} />
        </div>
    );
}

interface RenderNodeProps {
    node: any;
}

function RenderNode({ node }: RenderNodeProps) {
    if (!node) return null;

    switch (node.type) {
        case 'doc':
            return (
                <div>
                    {node.content?.map((child: any, index: number) => (
                        <RenderNode key={index} node={child} />
                    ))}
                </div>
            );

        case 'heading':
            const level = node.attrs?.level || 1;
            let headingClasses = "text-white mb-4 ";
            if (level === 1) headingClasses += "font-black text-3xl sm:text-4xl";
            else if (level === 2) headingClasses += "font-bold text-2xl sm:text-3xl";
            else if (level === 3) headingClasses += "font-semibold text-xl sm:text-2xl";
            else headingClasses += "font-medium text-lg";
            const headingContent = node.content?.map((child: any, index: number) => (
                <RenderNode key={index} node={child} />
            ));

            switch (level) {
                case 1:
                    return <h1 className={headingClasses}>{headingContent}</h1>;
                case 2:
                    return <h2 className={headingClasses}>{headingContent}</h2>;
                case 3:
                    return <h3 className={headingClasses}>{headingContent}</h3>;
                case 4:
                    return <h4 className={headingClasses}>{headingContent}</h4>;
                case 5:
                    return <h5 className={headingClasses}>{headingContent}</h5>;
                case 6:
                    return <h6 className={headingClasses}>{headingContent}</h6>;
                default:
                    return <h1 className={headingClasses}>{headingContent}</h1>;
            }

        case 'paragraph':
            return (
                <p className="text-gray-300 mb-4">
                    {node.content?.map((child: any, index: number) => (
                        <RenderNode key={index} node={child} />
                    ))}
                </p>
            );

        case 'bulletList':
            return (
                <ul className="list-disc list-inside mb-4 text-gray-300">
                    {node.content?.map((child: any, index: number) => (
                        <RenderNode key={index} node={child} />
                    ))}
                </ul>
            );

        case 'orderedList':
            return (
                <ol className="list-decimal list-inside mb-4 text-gray-300">
                    {node.content?.map((child: any, index: number) => (
                        <RenderNode key={index} node={child} />
                    ))}
                </ol>
            );

        case 'listItem':
            return (
                <li className="mb-2">
                    {node.content?.map((child: any, index: number) => (
                        <RenderNode key={index} node={child} />
                    ))}
                </li>
            );

        case 'text':
            let textElement = <span>{node.text}</span>;

            if (node.marks) {
                node.marks.forEach((mark: any) => {
                    switch (mark.type) {
                        case 'bold':
                            textElement = <strong className="font-bold text-white">{textElement}</strong>;
                            break;
                        case 'italic':
                            textElement = <em className="italic">{textElement}</em>;
                            break;
                        case 'code':
                            textElement = <code className="bg-gray-800 px-1 py-0.5 rounded text-purple-300">{textElement}</code>;
                            break;
                    }
                });
            }

            return textElement;

        case 'codeBlock':
            return (
                <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4 overflow-x-auto">
                    <code className="text-purple-300">
                        {node.content?.map((child: any, index: number) => (
                            <RenderNode key={index} node={child} />
                        ))}
                    </code>
                </pre>
            );

        case 'blockquote':
            return (
                <blockquote className="border-l-4 border-purple-500 pl-4 mb-4 text-gray-300 italic">
                    {node.content?.map((child: any, index: number) => (
                        <RenderNode key={index} node={child} />
                    ))}
                </blockquote>
            );

        default:
            return null;
    }
} 