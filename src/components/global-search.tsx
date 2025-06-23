"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAppwriteSessionToken } from '@/lib/utils';

interface SearchResult {
    id: string;
    type: 'content' | 'user';
    title: string;
    subtitle?: string;
    description?: string;
    url: string;
    department?: string;
    contentType?: string;
    status?: string;
    tags?: string[];
    rank?: string;
    callsign?: string;
    activity?: string;
}

interface GlobalSearchProps {
    className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Keyboard shortcut to open search
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setQuery('');
            setResults([]);
            setIsLoading(false);
        }
    }, [open]);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        console.log('Performing search for:', searchQuery);
        setIsLoading(true);
        try {
            const sessionToken = getAppwriteSessionToken();
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'X-Fallback-Cookies': sessionToken || ''
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Search response:', data);
                console.log('Setting results:', data.results || []);
                setResults(data.results || []);
            } else {
                console.error('Search failed:', response.statusText);
                setResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        if (!open) return; // Don't search if dialog is closed

        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, performSearch, open]);

    const handleSelect = (result: SearchResult) => {
        setOpen(false);
        setQuery('');
        window.location.href = result.url;
    };

    const getResultIcon = (result: SearchResult) => {
        if (result.type === 'user') {
            return 'heroicons:user-16-solid';
        }

        switch (result.contentType) {
            case 'sop': return 'heroicons:document-text-16-solid';
            case 'guide': return 'heroicons:book-open-16-solid';
            case 'announcement': return 'heroicons:megaphone-16-solid';
            case 'resource': return 'heroicons:folder-16-solid';
            case 'training': return 'heroicons:academic-cap-16-solid';
            case 'policy': return 'heroicons:shield-check-16-solid';
            default: return 'heroicons:document-16-solid';
        }
    };

    const getDepartmentColor = (department: string) => {
        switch (department) {
            case 'ems': return 'bg-purple-500/20 text-purple-300';
            case 'police': return 'bg-blue-500/20 text-blue-300';
            case 'fire': return 'bg-red-500/20 text-red-300';
            case 'doj': return 'bg-yellow-500/20 text-yellow-300';
            case 'government': return 'bg-green-500/20 text-green-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-500/20 text-green-300';
            case 'draft': return 'bg-yellow-500/20 text-yellow-300';
            case 'archived': return 'bg-gray-500/20 text-gray-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    const groupedResults = results.reduce((acc, result) => {
        const group = result.type === 'user' ? 'People' : 'Content';
        if (!acc[group]) acc[group] = [];
        acc[group].push(result);
        return acc;
    }, {} as Record<string, SearchResult[]>);

    console.log('Current state:', { query, results: results.length, isLoading, groupedResults });

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
                className={`relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 ${className || ''}`}
            >
                <Icon icon="heroicons:magnifying-glass-16-solid" className="h-4 w-4 xl:mr-2" />
                <span className="hidden xl:inline-flex">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border border-gray-600 bg-gray-800 px-1.5 font-mono text-xs font-medium text-gray-400 xl:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen} dialogClassName="max-w-2xl">
                <CommandInput
                    placeholder="Search content, people, and more..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList key={`${query}-${results.length}-${isLoading}`} className="max-h-[60vh] md:max-h-[500px]">
                    {isLoading && (
                        <div className="flex items-center justify-center p-6">
                            <Icon icon="heroicons:arrow-path-16-solid" className="h-5 w-5 animate-spin text-gray-400" />
                            <span className="ml-3 text-sm text-gray-400">Searching...</span>
                        </div>
                    )}

                    {!isLoading && query.length >= 2 && results.length === 0 && (
                        <div className="p-6 text-center text-sm text-gray-400">
                            No results found for "{query}"
                        </div>
                    )}

                    {!isLoading && results.length > 0 && (
                        <>
                            {Object.entries(groupedResults).map(([group, groupResults]) => (
                                <CommandGroup key={`${group}-${groupResults.length}`} heading={group}>
                                    {groupResults.map((result) => (
                                        <CommandItem
                                            key={`${result.id}-${result.type}`}
                                            value={`${result.title}-${result.id}`}
                                            onSelect={() => handleSelect(result)}
                                            className="flex items-start gap-4 px-4 py-3 cursor-pointer hover:bg-gray-800/50 rounded-lg mx-2 my-1"
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="p-2 bg-gray-800/70 rounded-lg border border-gray-800/50">
                                                    <Icon icon={getResultIcon(result)} className="h-5 w-5 text-purple-400" />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-base font-semibold text-white truncate">
                                                        {result.title}
                                                    </h4>
                                                    {result.status && (
                                                        <Badge className={`text-xs font-medium border-0 ${getStatusColor(result.status)}`}>
                                                            {result.status}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {result.subtitle && (
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {result.subtitle}
                                                    </p>
                                                )}

                                                {result.tags && result.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {result.tags.slice(0, 4).map((tag) => (
                                                            <Badge key={tag} className="text-xs font-medium text-gray-300 bg-gray-800/60 border-gray-800/60 border">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {result.tags.length > 4 && (
                                                            <span className="text-xs text-gray-500 font-medium self-center">+{result.tags.length - 4} more</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors">
                                                <Icon icon="heroicons:arrow-top-right-on-square-16-solid" className="h-4 w-4" />
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                        </>
                    )}

                    {!isLoading && query.length < 2 && (
                        <div className="p-6 text-center">
                            <Icon icon="heroicons:magnifying-glass-circle-solid" className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-300 mb-1">Search the Portal</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Find content, people, SOPs, and more across all departments.
                            </p>
                            <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <kbd className="px-2 py-1 bg-gray-800 border border-gray-800 rounded-md font-mono">↑↓</kbd>
                                    <span>to navigate</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <kbd className="px-2 py-1 bg-gray-800 border border-gray-800 rounded-md font-mono">Enter</kbd>
                                    <span>to select</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <kbd className="px-2 py-1 bg-gray-800 border border-gray-800 rounded-md font-mono">Esc</kbd>
                                    <span>to close</span>
                                </span>
                            </div>
                        </div>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
} 