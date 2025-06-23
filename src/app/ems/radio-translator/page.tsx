import { AIRadioTranslator } from '@/components/ai-radio-translator';
import { Icon } from '@iconify/react';

export default function RadioTranslatorPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-full">
                            <Icon icon="heroicons:megaphone-16-solid" className="h-8 w-8 text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white">
                            AI Radio Translator
                        </h1>
                    </div>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Convert natural language to proper radio communications using USRP EMS 10-codes and response protocols
                    </p>
                </div>

                {/* Main Component */}
                <AIRadioTranslator />

                {/* Additional Information */}
                <div className="mt-12 text-center">
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-6 max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold text-white mb-3">How it works</h3>
                        <div className="text-gray-300 space-y-2 text-sm">
                            <p>
                                This AI-powered tool analyzes your natural language input and converts it to proper radio communications
                                using the official USRP EMS 10-codes and response protocols.
                            </p>
                            <p>
                                Simply type what you want to communicate in plain English, and the AI will suggest the appropriate
                                radio call sign format, detect relevant codes, and provide additional suggestions for proper protocol.
                            </p>
                            <p className="text-blue-300 pt-2">
                                Reference: <a
                                    href="https://www.usrp.info/ems/resource/10-codes"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-blue-200"
                                >
                                    USRP EMS 10-Codes Reference
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 