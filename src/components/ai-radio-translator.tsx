"use client";

import { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// 10-Codes and Response Codes from USRP EMS Reference
const TEN_CODES = {
    '10-1': 'Clear Radio/Stop Transmitting',
    '10-2': 'Solid Copy',
    '10-4': 'Acknowledgement',
    '10-6': 'Change Channel',
    '10-7': 'Out of Service',
    '10-8': 'Back In Service',
    '10-9': 'Repeat',
    '10-12': 'Standby',
    '10-13': 'Shots Fired',
    '10-20': 'Location',
    '10-22': 'Disregard',
    '10-23': 'Arrived on scene',
    '10-24': 'Done with last call',
    '10-25': 'Report in Person (Meet)',
    '10-30': 'Unnecessary Radio Use',
    '10-32': 'Individual With a Gun',
    '10-36': 'Hostage Situation',
    '10-50': 'Vehicle Crash',
    '10-51': 'Tow/Vehicle Repair Needed',
    '10-52': 'Requesting Ambulance',
    '10-76': 'Enroute to Call',
    '10-77': 'E.T.A',
    '10-78': 'Back Up Required',
    '10-97': 'Radio Check'
};

const RESPONSE_CODES = {
    'Code 0': 'Game Issue',
    'Code 1': 'No lights or Sirens',
    'Code 2': 'Lights only',
    'Code 3': 'Lights and Sirens',
    'Code 4': 'Situation all Clear',
    'Code 6': 'Situation NOT Clear',
    'Code(BK) 99': 'Priority Emergency',
    'Signal 100': 'Priority Radio traffic'
};

// Keywords and their associated codes
const KEYWORD_MAPPINGS = {
    // Movement/Status
    'on the way': '10-76',
    'enroute': '10-76',
    'heading': '10-76',
    'going': '10-76',
    'arriving': '10-23',
    'arrived': '10-23',
    'on scene': '10-23',
    'finished': '10-24',
    'done': '10-24',
    'complete': '10-24',
    'clear': '10-24',
    'back in service': '10-8',
    'available': '10-8',
    'out of service': '10-7',
    'unavailable': '10-7',
    'off duty': '10-7',

    // Emergency situations
    'shots fired': '10-13',
    'shooting': '10-13',
    'gunfire': '10-13',
    'armed': '10-32',
    'gun': '10-32',
    'weapon': '10-32',
    'hostage': '10-36',
    'crash': '10-50',
    'accident': '10-50',
    'collision': '10-50',
    'ambulance': '10-52',
    'medical': '10-52',
    'backup': '10-78',
    'assistance': '10-78',
    'help': '10-78',

    // Communication
    'location': '10-20',
    'where': '10-20',
    'repeat': '10-9',
    'say again': '10-9',
    'copy': '10-2',
    'understood': '10-2',
    'roger': '10-4',
    'acknowledge': '10-4',
    'disregard': '10-22',
    'ignore': '10-22',
    'cancel': '10-22',

    // Response codes
    'emergency': 'Code 3',
    'urgent': 'Code 3',
    'priority': 'Code 3',
    'lights and sirens': 'Code 3',
    'code 3': 'Code 3',
    'lights only': 'Code 2',
    'code 2': 'Code 2',
    'no lights': 'Code 1',
    'routine': 'Code 1',
    'code 1': 'Code 1',
    'all clear': 'Code 4',
    'secure': 'Code 4',
    'safe': 'Code 4',
    'not clear': 'Code 6',
    'unsafe': 'Code 6',
    'active': 'Code 6'
};

interface TranslationResult {
    originalText: string;
    suggestedCallSign: string;
    detectedCodes: Array<{
        code: string;
        description: string;
        context: string;
    }>;
    confidence: number;
    suggestions: string[];
}

export function AIRadioTranslator() {
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<TranslationResult | null>(null);

    const analyzeText = useCallback((text: string): TranslationResult => {
        const lowerText = text.toLowerCase();
        const detectedCodes: Array<{ code: string; description: string; context: string }> = [];
        const suggestions: string[] = [];

        // Analyze for keywords and map to codes
        Object.entries(KEYWORD_MAPPINGS).forEach(([keyword, code]) => {
            if (lowerText.includes(keyword)) {
                const description = TEN_CODES[code as keyof typeof TEN_CODES] ||
                    RESPONSE_CODES[code as keyof typeof RESPONSE_CODES];
                if (description) {
                    detectedCodes.push({
                        code,
                        description,
                        context: keyword
                    });
                }
            }
        });

        // Generate call sign based on detected patterns
        let suggestedCallSign = '';
        let callSign = 'Unit'; // Default callsign

        // Extract potential callsign from text
        const callSignMatch = text.match(/\b([A-Z]+\d+|[A-Z]+-\d+|\d+[A-Z]+)\b/i);
        if (callSignMatch) {
            callSign = callSignMatch[0].toUpperCase();
        }

        // Build call sign based on detected codes
        if (detectedCodes.some(c => c.code === '10-76')) {
            // Enroute
            const responseCode = detectedCodes.find(c => c.code.startsWith('Code'))?.code || 'Code 2';
            suggestedCallSign = `${callSign} 10-76, ${responseCode}`;

            // Add additional context
            if (lowerText.includes('eta') || lowerText.includes('minutes')) {
                const etaMatch = text.match(/(\d+)\s*(minutes?|mins?)/i);
                if (etaMatch) {
                    suggestedCallSign += `, 10-77 ${etaMatch[1]} minutes`;
                }
            }

            // Add personnel count
            const personnelMatch = text.match(/(\d+)\s*(other|additional|more)?\s*(ems|medic|personnel|officers?|units?)/i);
            if (personnelMatch) {
                suggestedCallSign += ` with ${personnelMatch[1]} additional personnel`;
            }
        }

        if (detectedCodes.some(c => c.code === '10-23')) {
            // On scene
            suggestedCallSign = `${callSign} 10-23`;

            // Add situation assessment
            if (detectedCodes.some(c => c.code === 'Code 4')) {
                suggestedCallSign += ', Code 4';
            } else if (detectedCodes.some(c => c.code === 'Code 6')) {
                suggestedCallSign += ', Code 6';
            }
        }

        if (detectedCodes.some(c => c.code === '10-24')) {
            // Done with call
            suggestedCallSign = `${callSign} 10-24, back 10-8`;
        }

        // Emergency situations
        if (detectedCodes.some(c => c.code === '10-13')) {
            suggestedCallSign = `${callSign} 10-13, requesting 10-78`;
        }

        if (detectedCodes.some(c => c.code === '10-52')) {
            suggestedCallSign = `${callSign} 10-52, Code 3 response`;
        }

        // Generate additional suggestions
        if (lowerText.includes('down') || lowerText.includes('injured') || lowerText.includes('casualties')) {
            suggestions.push('Consider requesting additional medical units (10-52)');
            suggestions.push('Request supervisor response if multiple casualties');
        }

        if (lowerText.includes('suspects') || lowerText.includes('armed')) {
            suggestions.push('Notify of potential 10-32 (Individual with a gun)');
            suggestions.push('Request law enforcement backup (10-78)');
        }

        if (lowerText.includes('officers down')) {
            suggestions.push('Declare Code(BK) 99 - Priority Emergency');
            suggestions.push('Request immediate medical response');
        }

        // Calculate confidence based on number of matches
        const confidence = Math.min((detectedCodes.length / 3) * 100, 100);

        return {
            originalText: text,
            suggestedCallSign: suggestedCallSign || `${callSign} - Unable to determine appropriate call sign`,
            detectedCodes,
            confidence,
            suggestions
        };
    }, []);

    const handleTranslate = useCallback(async () => {
        if (!inputText.trim()) return;

        setIsProcessing(true);

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const translationResult = analyzeText(inputText);
        setResult(translationResult);
        setIsProcessing(false);
    }, [inputText, analyzeText]);

    const handleCopyCallSign = useCallback(() => {
        if (result?.suggestedCallSign) {
            navigator.clipboard.writeText(result.suggestedCallSign);
        }
    }, [result]);

    const exampleTexts = [
        "I am on the way with 2 other EMS to the latest call, 2 suspects and 2 officers are down",
        "Arrived on scene, situation is secure, no further assistance needed",
        "Enroute to vehicle crash, ETA 5 minutes, Code 3 response",
        "Finished with medical call, back in service and available",
        "Shots fired at location, requesting immediate backup"
    ];

    return (
        <Card className="w-full max-w-4xl mx-auto backdrop-blur-sm bg-white/5 border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Icon icon="heroicons:megaphone-16-solid" className="h-5 w-5 text-blue-400" />
                    AI Radio Translator
                </CardTitle>
                <p className="text-sm text-gray-300">
                    Convert natural language to proper radio call signs using USRP EMS 10-codes
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block text-white">
                            Natural Language Input
                        </label>
                        <Textarea
                            placeholder="Type your message in natural language..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="min-h-[100px] bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleTranslate}
                            disabled={!inputText.trim() || isProcessing}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {isProcessing ? (
                                <>
                                    <Icon icon="heroicons:arrow-path-16-solid" className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Icon icon="heroicons:language-16-solid" className="mr-2 h-4 w-4" />
                                    Translate to Radio
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Example Buttons */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-white">Quick Examples:</p>
                    <div className="flex flex-wrap gap-2">
                        {exampleTexts.map((example, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => setInputText(example)}
                                className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                                Example {index + 1}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Results Section */}
                {result && (
                    <>
                        <Separator className="bg-gray-600" />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">Translation Result</h3>
                                <Badge variant={result.confidence > 70 ? "default" : result.confidence > 40 ? "secondary" : "destructive"}>
                                    {result.confidence.toFixed(0)}% Confidence
                                </Badge>
                            </div>

                            {/* Suggested Call Sign */}
                            <Card className="bg-blue-950/30 border-blue-700">
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-blue-300">
                                            Suggested Radio Call:
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCopyCallSign}
                                            className="border-blue-600 text-blue-300 hover:bg-blue-700"
                                        >
                                            <Icon icon="heroicons:clipboard-16-solid" className="mr-1 h-3 w-3" />
                                            Copy
                                        </Button>
                                    </div>
                                    <p className="font-mono text-lg bg-gray-800 text-white p-3 rounded border border-gray-600">
                                        {result.suggestedCallSign}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Detected Codes */}
                            {result.detectedCodes.length > 0 && (
                                <div>
                                    <h4 className="text-md font-medium mb-3 text-white">Detected Codes:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {result.detectedCodes.map((detection, index) => (
                                            <Card key={index} className="p-3 bg-gray-800/50 border-gray-600">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <Badge variant="secondary" className="mb-1 bg-purple-600 text-white">
                                                            {detection.code}
                                                        </Badge>
                                                        <p className="text-sm font-medium text-white">{detection.description}</p>
                                                        <p className="text-xs text-gray-400">
                                                            Detected from: &quot;{detection.context}&quot;
                                                        </p>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggestions */}
                            {result.suggestions.length > 0 && (
                                <div>
                                    <h4 className="text-md font-medium mb-3 text-white">Additional Suggestions:</h4>
                                    <div className="space-y-2">
                                        {result.suggestions.map((suggestion, index) => (
                                            <div key={index} className="flex items-start gap-2 p-2 bg-yellow-950/30 border border-yellow-700 rounded">
                                                <Icon icon="heroicons:light-bulb-16-solid" className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-yellow-200">{suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Reference Section */}
                <Separator className="bg-gray-600" />
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Quick Reference</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-gray-800/50 border-gray-600">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-white">Common 10-Codes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {Object.entries(TEN_CODES).slice(0, 8).map(([code, description]) => (
                                    <div key={code} className="flex justify-between text-xs">
                                        <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">{code}</Badge>
                                        <span className="text-gray-400">{description}</span>
                                    </div>
                                ))}
                                <p className="text-xs text-gray-400 pt-2">
                                    <a
                                        href="https://www.usrp.info/ems/resource/10-codes"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline"
                                    >
                                        View full reference →
                                    </a>
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 border-gray-600">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-white">Response Codes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {Object.entries(RESPONSE_CODES).slice(0, 6).map(([code, description]) => (
                                    <div key={code} className="flex justify-between text-xs">
                                        <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">{code}</Badge>
                                        <span className="text-gray-400">{description}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 