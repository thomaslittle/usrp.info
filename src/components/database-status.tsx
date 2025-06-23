'use client';

import React, { useEffect, useState } from 'react';

interface DatabaseStatusProps {
    className?: string;
}

export function DatabaseStatus({ className = '' }: DatabaseStatusProps) {
    const [isSeeded, setIsSeeded] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkStatus() {
            try {
                const response = await fetch('/api/seed');
                const data = await response.json();
                setIsSeeded(data.isSeeded);
            } catch (error) {
                console.error('Error checking database status:', error);
                setIsSeeded(false);
            } finally {
                setLoading(false);
            }
        }

        checkStatus();
    }, []);

    if (loading) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Checking database...</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`w-2 h-2 rounded-full ${isSeeded ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-400">
                Database: {isSeeded ? 'Connected & Seeded' : 'Not Connected'}
            </span>
        </div>
    );
} 