"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EMSReferenceGuide() {
    const [activeTab, setActiveTab] = useState<'ems' | 'doctors'>('ems');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-violet-900 to-purple-900 border-b border-purple-500/20  z-0">

                <div className="relative container mx-auto px-6 py-16">
                    <div className="flex items-center justify-center">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-6">
                                <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-2xl shadow-purple-500/25">
                                    <Icon icon="heroicons:heart-16-solid" className="h-12 w-12 text-white" />
                                </div>
                            </div>
                            <h1 className="text-4xl sm:text-6xl font-black text-white mb-4">
                                <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
                                    MEDICAL REFERENCE
                                </span>
                            </h1>
                            <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto">
                                Emergency Response & Hospital Protocol Guide
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Modern Tab Navigation */}
                <div className="flex justify-center mb-12">
                    <div className="bg-gray-900/50 backdrop-blur-sm p-2 rounded-2xl border border-gray-800">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('ems')}
                                className={`px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 flex items-center gap-3 ${activeTab === 'ems'
                                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                    }`}
                            >
                                <Icon icon="heroicons:truck-16-solid" className="h-5 w-5" />
                                <span className="hidden md:inline">EMS</span>
                                <span className="md:hidden">Public</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('doctors')}
                                className={`px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 flex items-center gap-3 ${activeTab === 'doctors'
                                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                    }`}
                            >
                                <Icon icon="heroicons:user-plus-16-solid" className="h-5 w-5" />
                                <span className="hidden md:inline">Doctors</span>
                                <span className="md:hidden">Whitelist</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* EMS Tab Content */}
                {activeTab === 'ems' && (
                    <div className="space-y-12">
                        {/* How to Speak 10 Code */}
                        <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-purple-900/50 to-violet-900/50 border-b border-gray-800">
                                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
                                    <Icon icon="heroicons:radio-16-solid" className="h-6 w-6 text-purple-400" />
                                    How to Speak 10 Code
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-purple-400 text-xl font-semibold mb-4 flex items-center gap-2">
                                                <Icon icon="heroicons:megaphone-16-solid" className="h-5 w-5" />
                                                Call Format
                                            </h3>
                                            <div className="bg-gradient-to-r from-purple-900/30 to-violet-900/30 p-6 rounded-xl border border-purple-500/20">
                                                <div className="space-y-3">
                                                    <div className="text-purple-300 font-semibold">
                                                        Unit Call Sign | Unit Number | EMTs | Enroute | Street Name | # of Patients
                                                    </div>
                                                    <div className="text-gray-300 text-sm">
                                                        Example: &quot;800 Plus One 10-76 to Strawberry Ave, One Critical&quot;
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-purple-400 text-xl font-semibold mb-4 flex items-center gap-2">
                                                <Icon icon="heroicons:list-bullet-16-solid" className="h-5 w-5" />
                                                Response Protocol
                                            </h3>
                                            <div className="space-y-4">
                                                {[
                                                    'Ensure the scene is not active. If not, establish stage 2 perimeter',
                                                    'Remove patient from harm&apos;s way and assess their condition',
                                                    'Stabilize the patient sufficiently for transport',
                                                    'Notify Nurses/Doctors (10-76) of incoming patient status',
                                                    'Transport to hospital and provide detailed handoff'
                                                ].map((step, index) => (
                                                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-800">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                                                            {index + 1}
                                                        </div>
                                                        <span className="text-gray-300">{step}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-purple-400 text-xl font-semibold mb-4 flex items-center gap-2">
                                                <Icon icon="heroicons:chart-bar-16-solid" className="h-5 w-5" />
                                                Flow Chart Guidelines
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6 rounded-xl border border-green-500/20">
                                                    <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                                                        <Icon icon="heroicons:check-circle-16-solid" className="h-5 w-5" />
                                                        With Nurses/Doctors Online
                                                    </h4>
                                                    <p className="text-gray-300 text-sm leading-relaxed">
                                                        Ensure scene safety, stabilize patient, call ahead (10-76) for preparation, then transport with one critical patient maximum.
                                                    </p>
                                                </div>

                                                <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-6 rounded-xl border border-amber-500/20">
                                                    <h4 className="text-amber-300 font-semibold mb-3 flex items-center gap-2">
                                                        <Icon icon="heroicons:exclamation-triangle-16-solid" className="h-5 w-5" />
                                                        No Medical Staff Available
                                                    </h4>
                                                    <p className="text-gray-300 text-sm leading-relaxed">
                                                        Secure scene, remove patient from danger, provide emergency stabilization, transport immediately or arrange alternative care.
                                                    </p>
                                                </div>

                                                <div className="bg-gradient-to-r from-red-900/30 to-rose-900/30 p-6 rounded-xl border border-red-500/20">
                                                    <h4 className="text-red-300 font-semibold mb-3 flex items-center gap-2">
                                                        <Icon icon="heroicons:shield-exclamation-16-solid" className="h-5 w-5" />
                                                        Critical Safety Note
                                                    </h4>
                                                    <p className="text-gray-300 text-sm leading-relaxed">
                                                        DO NOT perform surgery. ONLY trained medical personnel should perform advanced procedures. Focus on basic life support and rapid transport.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Communication and Incident Codes */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Communication Codes */}
                            <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-b border-gray-800">
                                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                                        <Icon icon="heroicons:chat-bubble-left-right-16-solid" className="h-6 w-6 text-blue-400" />
                                        Communication Codes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                        {[
                                            { code: '10-1', meaning: 'Unclear Transmission' },
                                            { code: '10-2', meaning: 'Transmission Clear' },
                                            { code: '10-3', meaning: 'Stop Transmission | Radio Traffic Only' },
                                            { code: '10-4', meaning: 'Copy/Understand' },
                                            { code: '10-6', meaning: 'Busy, Available for Emergencies' },
                                            { code: '10-7', meaning: 'Unavailable' },
                                            { code: '10-8', meaning: 'Back in Service' },
                                            { code: '10-9', meaning: 'Repeat Transmission' },
                                            { code: '10-13', meaning: 'Officer Down (Immediate Assistance)' },
                                            { code: '10-19', meaning: 'Returning to Scene' },
                                            { code: '10-20', meaning: 'Location' },
                                            { code: '10-21', meaning: 'Phone Call' },
                                            { code: '10-22', meaning: 'Disregard Last Transmission' },
                                            { code: '10-23', meaning: 'Arriving' },
                                            { code: '10-25', meaning: 'Meetup/Rendezvous' },
                                            { code: '10-28', meaning: 'Record Check' }
                                        ].map(({ code, meaning }) => (
                                            <div
                                                key={code}
                                                className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-gray-800/30 rounded-lg border border-gray-800 hover:border-blue-500/50 hover:bg-blue-900/10 transition-all duration-200 group"
                                            >
                                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-lg min-w-[3rem] sm:min-w-[4rem] text-center">
                                                    {code}
                                                </div>
                                                <div className="text-gray-300 text-sm group-hover:text-white transition-colors">
                                                    {meaning}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Incident Codes */}
                            <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-b border-gray-800">
                                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                                        <Icon icon="heroicons:exclamation-triangle-16-solid" className="h-6 w-6 text-orange-400" />
                                        Incident Codes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                        {[
                                            { code: '10-38', meaning: 'Traffic Stop' },
                                            { code: '10-41', meaning: 'On Duty' },
                                            { code: '10-42', meaning: 'Off Duty' },
                                            { code: '10-47', meaning: 'Injured/Downed Individual' },
                                            { code: '10-50', meaning: 'Motor Vehicle Accident (MVA)' },
                                            { code: '10-51', meaning: 'Request Tow' },
                                            { code: '10-52', meaning: 'Medic Requested' },
                                            { code: '10-69', meaning: 'In-Car Meeting' },
                                            { code: '10-76', meaning: 'Enroute' },
                                            { code: '10-77', meaning: 'Backup Needed for Non-Emergency' },
                                            { code: '10-78', meaning: 'Urgent Backup Needed' },
                                            { code: '10-80', meaning: 'Car Chase' },
                                            { code: '10-95', meaning: 'Suspect in Custody' },
                                            { code: '10-98', meaning: 'Jail Break/Custody Break in Progress' },
                                            { code: '10-99', meaning: 'Flagged Stolen Vehicle' },
                                            { code: '10-100', meaning: 'Fixing Your Radio (Relog)' }
                                        ].map(({ code, meaning }) => (
                                            <div
                                                key={code}
                                                className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-gray-800/30 rounded-lg border border-gray-800 hover:border-orange-500/50 hover:bg-orange-900/10 transition-all duration-200 group"
                                            >
                                                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-lg min-w-[3rem] sm:min-w-[4rem] text-center">
                                                    {code}
                                                </div>
                                                <div className="text-gray-300 text-xs sm:text-sm group-hover:text-white transition-colors">
                                                    {meaning}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Priority Response Codes */}
                        <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-b border-gray-800">
                                <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                                    <Icon icon="heroicons:signal-16-solid" className="h-6 w-6 text-emerald-400" />
                                    Priority Response Codes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { code: 'Code 1', description: 'Non-Emergency\nNo lights or sirens', color: 'from-green-500 to-emerald-600', borderColor: 'border-green-500/50' },
                                        { code: 'Code 2', description: 'Non-Critical\nLights on, no sirens', color: 'from-yellow-500 to-amber-600', borderColor: 'border-yellow-500/50' },
                                        { code: 'Code 3', description: 'Emergency\nLights and sirens on', color: 'from-red-500 to-rose-600', borderColor: 'border-red-500/50' },
                                        { code: 'Code 4', description: 'Scene is Clear', color: 'from-blue-500 to-indigo-600', borderColor: 'border-blue-500/50' },
                                        { code: 'Code White', description: 'No trace of patient', color: 'from-gray-500 to-slate-600', borderColor: 'border-gray-500/50' },
                                        { code: 'Code Green', description: 'Lockdown', color: 'from-emerald-500 to-green-600', borderColor: 'border-emerald-500/50' }
                                    ].map(({ code, description, color, borderColor }) => (
                                        <div
                                            key={code}
                                            className={`relative overflow-hidden bg-gray-800/50 rounded-xl p-6 text-center border-2 ${borderColor} transition-all duration-300 group`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                                            <div className="relative">
                                                <div className={`text-2xl font-bold mb-3 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                                                    {code}
                                                </div>
                                                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                                    {description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* EMS Treatment Protocols */}
                        <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-900/50 to-violet-900/50 border-b border-gray-800">
                                <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                                    <Icon icon="heroicons:clipboard-document-list-16-solid" className="h-6 w-6 text-purple-400" />
                                    EMS Treatment Protocols
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {[
                                        {
                                            title: 'Blood Loss',
                                            equipment: 'Saline, Blood Bag',
                                            description: 'Apply saline or blood transfusion through IV to restore fluid volume',
                                            icon: 'heroicons:beaker-16-solid',
                                            color: 'from-red-500 to-rose-600'
                                        },
                                        {
                                            title: 'Broken Bones',
                                            equipment: 'Splint, C-Collar, Backboard, Bandages, Hemostatic Gauze',
                                            description: 'Apply splint to broken bone/limb. For neck or spinal fractures, use backboard and C-collar. Secure with bandages',
                                            icon: 'heroicons:wrench-screwdriver-16-solid',
                                            color: 'from-orange-500 to-amber-600'
                                        },
                                        {
                                            title: 'Burns',
                                            equipment: 'Saline',
                                            description: 'For 1st degree burns, apply saline to cool area. Wrap all burns with sterile bandages or gauze',
                                            icon: 'heroicons:fire-16-solid',
                                            color: 'from-yellow-500 to-orange-600'
                                        },
                                        {
                                            title: 'Collapsed Lung',
                                            equipment: 'Saline, Surgery Kit, Chest Tube, Oxygen Tank',
                                            description: 'Administer oxygen. Use saline to sterilize area, create chest incision, and insert chest tube',
                                            icon: 'heroicons:heart-16-solid',
                                            color: 'from-blue-500 to-indigo-600'
                                        },
                                        {
                                            title: 'Gun Shot Wound',
                                            equipment: 'Saline, Bandages, Hemostatic Gauze',
                                            description: 'Apply direct pressure to wound, irrigate with saline, and follow blood loss protocol if necessary',
                                            icon: 'heroicons:shield-exclamation-16-solid',
                                            color: 'from-red-500 to-rose-600'
                                        },
                                        {
                                            title: 'Heart Attack',
                                            equipment: 'AED, Nitroglycerin, Aspirin, Oxygen Tank',
                                            description: 'Give nitroglycerin spray/tablet and aspirin to chew. Use AED if necessary, administer oxygen',
                                            icon: 'heroicons:bolt-16-solid',
                                            color: 'from-pink-500 to-rose-600'
                                        },
                                        {
                                            title: 'Lacerations/Gashes',
                                            equipment: 'Bandages, Hemostatic Gauze, Saline, Surgery Kit',
                                            description: 'Clean wounds with saline, cover with bandages. Deep wounds may require suturing',
                                            icon: 'heroicons:scissors-16-solid',
                                            color: 'from-purple-500 to-violet-600'
                                        },
                                        {
                                            title: 'Low Pulse/CPR',
                                            equipment: 'Oxygen Bag, Oxygen Tank',
                                            description: 'Perform CPR: 30 chest compressions followed by 2 rescue breaths with oxygen bag',
                                            icon: 'heroicons:hand-raised-16-solid',
                                            color: 'from-green-500 to-emerald-600'
                                        },
                                        {
                                            title: 'Opioid Overdose',
                                            equipment: 'Narcan',
                                            description: 'Administer Narcan (naloxone) and transport to hospital immediately',
                                            icon: 'heroicons:no-symbol-16-solid',
                                            color: 'from-amber-500 to-yellow-600'
                                        },
                                        {
                                            title: 'Shock',
                                            equipment: 'Shock Blanket, Oxygen Tank',
                                            description: 'Keep legs elevated to direct blood flow to brain while administering oxygen',
                                            icon: 'heroicons:bolt-slash-16-solid',
                                            color: 'from-teal-500 to-cyan-600'
                                        },
                                        {
                                            title: 'Stroke',
                                            equipment: 'Oxygen Tank',
                                            description: 'Administer oxygen and transport to hospital as quickly as possible',
                                            icon: 'heroicons:exclamation-circle-16-solid',
                                            color: 'from-indigo-500 to-purple-600'
                                        },
                                        {
                                            title: 'Unconscious Person',
                                            equipment: 'Ammonia Inhalants',
                                            description: 'Attempt to wake by rubbing sternum with knuckles. Use ammonia inhalant if unsuccessful',
                                            icon: 'heroicons:moon-16-solid',
                                            color: 'from-slate-500 to-gray-600'
                                        }
                                    ].map((treatment) => (
                                        <div
                                            key={treatment.title}
                                            className="group relative overflow-hidden bg-gray-800/50 rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${treatment.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                                            <div className="relative">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`p-2 bg-gradient-to-br ${treatment.color} rounded-lg`}>
                                                        <Icon icon={treatment.icon} className="h-5 w-5 text-white" />
                                                    </div>
                                                    <h3 className="text-white font-bold text-lg">{treatment.title}</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="bg-gray-700/50 rounded-lg p-3">
                                                        <div className="text-purple-300 text-sm font-medium mb-1">Equipment:</div>
                                                        <div className="text-gray-300 text-sm">{treatment.equipment}</div>
                                                    </div>
                                                    <div className="text-gray-300 text-sm leading-relaxed">
                                                        {treatment.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Doctors Tab Content */}
                {activeTab === 'doctors' && (
                    <div className="space-y-12">
                        {/* Hospital Triage System */}
                        <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-b border-gray-800">
                                <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                                    <Icon icon="heroicons:chart-bar-square-16-solid" className="h-6 w-6 text-emerald-400" />
                                    Hospital Triage System
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        {
                                            color: 'Red',
                                            description: 'Immediate treatment required for life-threatening injuries or self-inflicted trauma',
                                            colorCode: 'from-red-500 to-rose-600',
                                            borderColor: 'border-red-500/50',
                                            icon: 'heroicons:exclamation-triangle-16-solid'
                                        },
                                        {
                                            color: 'Yellow',
                                            description: 'Patient is stable but will require medical treatment at some point, more critical have been treated first',
                                            colorCode: 'from-yellow-500 to-amber-600',
                                            borderColor: 'border-yellow-500/50',
                                            icon: 'heroicons:clock-16-solid'
                                        },
                                        {
                                            color: 'Green',
                                            description: 'Patients who will require medical treatment at some point, more critical patients have been treated first',
                                            colorCode: 'from-green-500 to-emerald-600',
                                            borderColor: 'border-green-500/50',
                                            icon: 'heroicons:check-circle-16-solid'
                                        },
                                        {
                                            color: 'Black',
                                            description: 'For those who are already deceased, or for patients whose injuries are so severe they are not likely to be helped',
                                            colorCode: 'from-gray-500 to-slate-600',
                                            borderColor: 'border-gray-500/50',
                                            icon: 'heroicons:x-circle-16-solid'
                                        }
                                    ].map((triage) => (
                                        <div
                                            key={triage.color}
                                            className={`relative overflow-hidden bg-gray-800/50 rounded-xl p-6 text-center border-2 ${triage.borderColor} transition-all duration-300 group`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${triage.colorCode} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                                            <div className="relative">
                                                <div className="flex items-center justify-center mb-4">
                                                    <div className={`p-3 bg-gradient-to-br ${triage.colorCode} rounded-xl`}>
                                                        <Icon icon={triage.icon} className="h-6 w-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className={`text-2xl font-bold mb-3 bg-gradient-to-r ${triage.colorCode} bg-clip-text text-transparent`}>
                                                    {triage.color}
                                                </div>
                                                <div className="text-gray-300 text-sm leading-relaxed">
                                                    {triage.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hospital Medication Guide */}
                        <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-900/50 to-violet-900/50 border-b border-gray-800">
                                <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                                    <Icon icon="heroicons:beaker-16-solid" className="h-6 w-6 text-purple-400" />
                                    Hospital Medication Guide
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        {
                                            category: 'Basic Pain Relief',
                                            medications: [
                                                'NSAID: Weakest to Strongest',
                                                'Acetaminophen/Paracetamol (Oral)',
                                                'Aspirin (Oral)',
                                                'Ibuprofen (Oral)',
                                                'Naproxen (Oral)',
                                                'Celecoxib (IV)'
                                            ],
                                            icon: 'heroicons:shield-check-16-solid',
                                            color: 'from-green-500 to-emerald-600'
                                        },
                                        {
                                            category: 'Heavy Pain Relief',
                                            medications: [
                                                'Nitrous Oxide (Gas)',
                                                'Opioid Weakest to Strongest',
                                                'Codeine (Oral)',
                                                'Morphine (Oral or IV)',
                                                'Hydromorphone (Shot or IV)',
                                                'Fentanyl (IV)'
                                            ],
                                            icon: 'heroicons:bolt-16-solid',
                                            color: 'from-red-500 to-rose-600'
                                        },
                                        {
                                            category: 'Antibiotics',
                                            medications: [
                                                'Broad Spectrum:',
                                                'Amoxicillin (Oral or IV) Contains Penicillin',
                                                'Erythromycin (Oral or IV)',
                                                'Narrow Spectrum / Staph:',
                                                'Vancomycin (IV)'
                                            ],
                                            icon: 'heroicons:bug-ant-16-solid',
                                            color: 'from-blue-500 to-indigo-600'
                                        },
                                        {
                                            category: 'Heart Conditions',
                                            medications: [
                                                'Cardiac:',
                                                'Chest Pains:',
                                                'Nitroglycerin (Under Tongue)',
                                                'Speed Up Heart:',
                                                'Atropine (IV)',
                                                'Adrenaline/Epinephrine (Shot or IV)',
                                                'Slow Down Heart:',
                                                'Adenosine (IV)',
                                                'High Blood Pressure:',
                                                'Atenolol (Oral or IV) (Beta Blocker)',
                                                'Metoprolol (Oral or IV) (Beta Blocker)',
                                                'Low Blood Pressure:',
                                                'Midodrine (Oral or IV)',
                                                'Lactated Ringers (IV)'
                                            ],
                                            icon: 'heroicons:heart-16-solid',
                                            color: 'from-pink-500 to-rose-600'
                                        },
                                        {
                                            category: 'Sedation',
                                            medications: [
                                                'Propofol (IV)',
                                                'Pentobarbital (IV)',
                                                'Midazolam (IV)',
                                                'Nimbex (IV)'
                                            ],
                                            icon: 'heroicons:moon-16-solid',
                                            color: 'from-purple-500 to-violet-600'
                                        },
                                        {
                                            category: 'Overdose Treatment',
                                            medications: [
                                                'Heroin/Meth/Cocaine:',
                                                'Naloxone (Nasal Spray)',
                                                'Sedative/NSAID:',
                                                'Activated Charcoal (Ingested)'
                                            ],
                                            icon: 'heroicons:shield-exclamation-16-solid',
                                            color: 'from-orange-500 to-amber-600'
                                        }
                                    ].map((medCategory) => (
                                        <div
                                            key={medCategory.category}
                                            className="group relative overflow-hidden bg-gray-800/50 rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${medCategory.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                                            <div className="relative">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`p-2 bg-gradient-to-br ${medCategory.color} rounded-lg`}>
                                                        <Icon icon={medCategory.icon} className="h-5 w-5 text-white" />
                                                    </div>
                                                    <h3 className="text-white font-bold text-lg">{medCategory.category}</h3>
                                                </div>
                                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                                    {medCategory.medications.map((med, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-gray-700/50 p-3 rounded-lg text-sm text-gray-300 hover:bg-gray-700/70 transition-colors"
                                                        >
                                                            {med.includes(':') ? (
                                                                <div className="text-purple-300 font-semibold">{med}</div>
                                                            ) : (
                                                                <div>{med}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center p-8 bg-gray-900/30 rounded-2xl mt-16 border border-gray-800 backdrop-blur-sm">
                    <p className="text-gray-400 text-sm">
                        Unscripted Roleplay Community • Emergency Response Reference Guide
                    </p>
                </div>
            </div>
        </div>
    );
} 