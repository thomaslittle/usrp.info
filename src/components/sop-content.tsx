"use client";

import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useEMSRoster } from '@/hooks/use-ems-roster';

const getRankColor = (rank: string) => {
    const lowerRank = rank.toLowerCase();
    if (lowerRank.includes('chief') || lowerRank.includes('head')) {
        return 'text-yellow-400 font-bold';
    }
    if (lowerRank.includes('captain') || lowerRank.includes('lieutenant')) {
        return 'text-purple-400';
    }
    if (lowerRank.includes('attending') || lowerRank.includes('paramedic') || lowerRank.includes('sr. emt') || lowerRank.includes('specialist')) {
        return 'text-sky-400';
    }
    if (lowerRank.includes('doctor')) {
        return 'text-green-400';
    }
    if (lowerRank.includes('intern')) {
        return 'text-gray-400';
    }
    return 'text-white';
};

// Data parsed from the spreadsheet
const scopeOfPracticeData = {
    headers: ["", "Intern", "EMT", "Sr. EMT", "Paramedic", "Resident+", "Lieutenant", "Captain", "HOD/P", "Chief"],
    rows: [
        { permission: "In Training", ranks: ["✔", "", "", "", "", "", "", "", ""] },
        { permission: "CPR Certified", ranks: ["", "✔", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Ride Alongs (Probies/Civ)", ranks: ["", "✔", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Administer IV's", ranks: ["", "", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Prescribe OTC Medication(s)", ranks: ["✔", "✔", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Prescribe Heavier Medication", ranks: ["", "", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Perform Intubations", ranks: ["", "", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Perform Chest Decompression", ranks: ["", "", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Perform Tracheotomy", ranks: ["", "", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "5150 Holds", ranks: ["", "", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Assigns Tasks", ranks: ["", "", "", "", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Surgical Operations", ranks: ["", "", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Division Command", ranks: ["", "", "", "", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Hire/Fire", ranks: ["", "", "", "", "", "", "", "", "✔"] },
        { permission: "Signs for DNR Patients", ranks: ["", "", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Surgical Operation Oversight", ranks: ["", "", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Training Oversight", ranks: ["", "", "", "", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Application Approvals", ranks: ["", "", "", "", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Handle IA Complaints", ranks: ["", "", "", "", "", "✔", "✔", "✔", "✔"] },
        { permission: "Promotion Oversight", ranks: ["", "", "", "", "", "✔", "✔", "✔", "✔"] },
        { permission: "Department Oversight", ranks: ["", "", "", "", "", "✔", "✔", "✔", "✔"] },
        { permission: "Community Outreach", ranks: ["✔", "✔", "✔", "✔", "✔", "✔", "✔", "✔", "✔"] },
        { permission: "Goals/Policies", ranks: ["", "", "", "", "", "", "✔", "✔", "✔"] },
        { permission: "Directives Oversight/Creation", ranks: ["", "", "", "", "", "", "✔", "✔", "✔"] },
    ]
};

const tenCodes = [
    { code: '10-1', meaning: 'Clear Radio/Stop Transmitting' }, { code: '10-24', meaning: 'Done with last call' },
    { code: '10-2', meaning: 'Solid Copy' }, { code: '10-25', meaning: 'Report in Person (Meet)' },
    { code: '10-4', meaning: 'Acknowledgement' }, { code: '10-30', meaning: 'Unnecessary Radio Use' },
    { code: '10-6', meaning: 'Change Channel' }, { code: '10-32', meaning: 'Individual With a Gun' },
    { code: '10-7', meaning: 'Out of Service' }, { code: '10-36', meaning: 'Hostage Situation' },
    { code: '10-8', meaning: 'Back In Service' }, { code: '10-50', meaning: 'Vehicle Crash' },
    { code: '10-9', meaning: 'Repeat' }, { code: '10-51', meaning: 'Tow/Vehicle Repair Needed' },
    { code: '10-12', meaning: 'Standby' }, { code: '10-52', meaning: 'Requesting Ambulance' },
    { code: '10-13', meaning: 'Shots Fired' }, { code: '10-76', meaning: 'Enroute to Call' },
    { code: '10-20', meaning: 'Location' }, { code: '10-77', meaning: 'E.T.A' },
    { code: '10-22', meaning: 'Disregard' }, { code: '10-78', meaning: 'Back Up Required' },
    { code: '10-23', meaning: 'Arrived on scene' }, { code: '10-97', meaning: 'Radio Check' },
];

const signalCodes = [
    { code: 'Code 0', meaning: 'Game Issue' },
    { code: 'Code 1', meaning: 'No lights or Sirens' },
    { code: 'Code 2', meaning: 'Lights only' },
    { code: 'Code 3', meaning: 'Lights and Sirens' },
    { code: 'Code 4', meaning: 'Situation all Clear' },
    { code: 'Code 6', meaning: 'Situation NOT Clear' },
    { code: 'Code(BK) 99', meaning: 'Priority Emergency' },
    { code: 'Signal 100', meaning: 'Priority Radio traffic' },
];

const strikeSystemData = {
    levels: [
        { level: 3, title: "Immediate Termination", problems: ["Felony Charges", "Corruption", "Derogatory Comments", "Tampering with Documents"], description: "Selling prescription drugs, giving out police info/location, treating without reporting, etc." },
        { level: 2, title: "Suspension & Investigation", problems: ["HIPAA Violation", "Non-Felony Charges", "On Duty Violence", "Poor Treatment"], description: "Giving info to officers/civs without warrant or consent, Adverts etc." },
        { level: 1, title: "Basic Strike", problems: ["Insubordination", "Firearm/Taser on Duty", "Treatments/Equipments not for your rank", "Driving Improperly"], description: "Failure to follow orders, having a weapon on duty, using equipment above rank, etc." },
        { level: 0, title: "Verbal Warning", problems: ["Issues with others in Dept."], description: "Excessive in-house arguments. Can be given a strike at discretion if it is a reoccurring issue." }
    ],
    footer: "Strikes disappear from an employee's record 1 month after they are committed. If 3 Strikes are achieved in a 3 month period, Immediate Termination."
};

const coronerInfo = {
    procedures: [
        "If a patient is declared DOA, proceed with the following:",
        "- Transport to SF Corner",
        "- Fill out a report / autopsy report (if applicable)",
        "- Log patient info (Name, DOB, Civilian ID)",
        "- Find out if patient has any ICE contacts",
        "- Post a announcement in state-news-feed (if requested)",
        "- Place body in mortuary cabinets w/ patient information"
    ],
    announcementTemplate: "SAMS regrets to inform the passing of (Full Name) on (Date), at (Time). Our thoughts and prayers go out to their friends and family.",
    morticianPractices: [
        "- Check body over to learn about their condition.",
        "- Adjust the body accordingly with tools and liquids.",
        "- Add or remove fluids from the body."
    ]
};

const generalProtocols = [
    { title: "Refusal to Treat", content: "Within our discipline, we have the right to refuse to treat an individual if we feel as if we are in an unsafe environment. If a patient is refusing treatment from EMS and medically needs to be transported to the hospital, you must NEVER force them. Advise them the importance of going to the hospital. If patient is a suspect of police they can not refuse treatment." },
    { title: "DNR Policy", content: "A federal law that protects patients' sensitive health information. It sets national standards for healthcare entities to ensure patient privacy and control over their health information." },
    { title: "Reporting to Duty", content: ["Announce you're 10-8 over the radio and stay on channel 1.", "Check Announcements for any updates", "Be in appropriate uniform for your rank", "Be stocked up on equipment.", "Have ambulances fueled, repaired, and clean."] },
    { title: "Speed Limits", content: "When going Code 3 to calls EMTs of ANY rank are only allowed to go 20mph over the speed limit. City - 35/55 Mph, Highways - 70/90 Mph, JoshuaRoad/Route - 68 65/85 Mph. When going Code 2 through intersections make sure you are clearing them before proceeding to avoid accidents. If not followed will lead to disciplinary actions." },
    { title: "Medical Supplies", content: ["10 - 15 First Aid Kits", "10 Bandages", "Flashlight", "Radio", "1-2 Fire Extinguisher (Put in Ambulance)", "3 Fire Oxygen Tanks (Put in Ambulance)", "Anything else is optional"] },
    { title: "LOA Policy", content: "Clear LOA with a High Command so the Roster can be adjusted accordingly. We understand School, work and any other personal reasons are most important. We will try to be as understaning as possible. LOA Requests need to be approved." },
    { title: "EMS vs Roleplay", content: "Not everyone is a doctor and knows the terminology. Only provide the medical rp that you are comfortable performing. I.E. Basic/Advance Life Support, surguries, etc.. We won't force you to do any medical rp you're not comfortable doing." },
];

const phoneticAlphabet = { A: "Alpha", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot", G: "Golf", H: "Hotel", I: "India", J: "Juliet", K: "Kilo", L: "Lima", M: "Mike", N: "November", O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo", S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey", X: "X-Ray", Y: "Yankee", Z: "Zulu" };

// Reusable components for displaying the data
const SectionCard = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
    <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-900/50 to-violet-900/50 border-b border-gray-800">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
                <Icon icon={icon} className="h-6 w-6 text-purple-400" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
            {children}
        </CardContent>
    </Card>
);

const ScopeOfPracticeTable = () => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-white uppercase bg-gray-800/50">
                <tr>
                    {scopeOfPracticeData.headers.map((header, i) => <th key={i} scope="col" className="px-6 py-3">{header}</th>)}
                </tr>
            </thead>
            <tbody>
                {scopeOfPracticeData.rows.map((row, i) => (
                    <tr key={i} className="bg-gray-900/50 border-b border-gray-800">
                        <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{row.permission}</th>
                        {row.ranks.map((rank, j) => <td key={j} className="px-6 py-4 text-center">{rank && <Icon icon="heroicons:check-circle-16-solid" className="h-5 w-5 text-green-400 mx-auto" />}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const RosterTable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: rosterData, isLoading, error } = useEMSRoster();

    const filteredRoster = useMemo(() => {
        if (!rosterData?.users) return [];
        return rosterData.users.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [rosterData?.users, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                    <Icon icon="heroicons:arrow-path-16-solid" className="h-6 w-6 animate-spin text-purple-400" />
                    <span className="text-gray-300">Loading department roster...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Icon icon="heroicons:exclamation-triangle-16-solid" className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Failed to load roster</h3>
                    <p className="text-gray-400">Unable to fetch department roster from database</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-purple-600 hover:bg-purple-700"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <Input
                    type="text"
                    placeholder="Search roster..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 max-w-md"
                />
                <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                    {filteredRoster.length} members
                </Badge>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-white uppercase bg-gray-800/50">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Rank</th>
                            <th className="px-4 py-3">Callsign</th>
                            <th className="px-4 py-3">Assignment</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center">Solo Cleared</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRoster.map((member, i) => (
                            <tr key={i} className="bg-gray-900/50 border-b border-gray-800">
                                <td className="px-4 py-3 font-medium text-white">{member.name}</td>
                                <td className={`px-4 py-3 ${getRankColor(member.rank)}`}>{member.rank}</td>
                                <td className="px-4 py-3"><Badge variant="outline" className="border-purple-500/50 text-purple-300">{member.callsign}</Badge></td>
                                <td className="px-4 py-3">{member.assignment}</td>
                                <td className="px-4 py-3"><Badge className={member.activity === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}>{member.activity}</Badge></td>
                                <td className="px-4 py-3 text-center">{member.soloCleared && <Icon icon="heroicons:check-circle-16-solid" className="h-5 w-5 text-green-400 mx-auto" />}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredRoster.length === 0 && searchTerm && (
                <div className="text-center py-8 text-gray-400">
                    No members found matching &quot;{searchTerm}&quot;
                </div>
            )}
        </div>
    );
};

const CodesList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h3 className="text-xl font-semibold text-white mb-4">10-Codes</h3>
            <div className="space-y-2">
                {tenCodes.map(code => <div key={code.code} className="flex justify-between p-2 bg-gray-800/30 rounded-md"><span className="font-mono text-purple-400">{code.code}</span> <span>{code.meaning}</span></div>)}
            </div>
        </div>
        <div>
            <h3 className="text-xl font-semibold text-white mb-4">Signal Codes</h3>
            <div className="space-y-2">
                {signalCodes.map(code => <div key={code.code} className="flex justify-between p-2 bg-gray-800/30 rounded-md"><span className="font-mono text-purple-400">{code.code}</span> <span>{code.meaning}</span></div>)}
            </div>
        </div>
    </div>
);

const StrikeSystem = () => (
    <div className="space-y-6">
        {strikeSystemData.levels.map(level => (
            <div key={level.level} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-2xl font-bold ${level.level === 3 ? 'text-red-400' : level.level === 2 ? 'text-orange-400' : level.level === 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                        Level {level.level > 0 ? level.level : 'Verbal'} - {level.title}
                    </h3>
                    <Badge variant="destructive" className={`${level.level === 3 ? 'bg-red-500/20 text-red-300' : level.level === 2 ? 'bg-orange-500/20 text-orange-300' : level.level === 1 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                        {level.level > 0 ? `${level.level} Strike${level.level > 1 ? 's' : ''}` : 'Warning'}
                    </Badge>
                </div>
                <p className="text-gray-400 mb-4">{level.description}</p>
                <div className="flex flex-wrap gap-2">
                    {level.problems.map(p => <Badge key={p} variant="outline" className="border-gray-600">{p}</Badge>)}
                </div>
            </div>
        ))}
        <div className="text-center text-gray-500 italic mt-6">{strikeSystemData.footer}</div>
    </div>
);

const CoronerProcedures = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h3 className="text-xl font-semibold text-white mb-4">Coroner Guidelines</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
                {coronerInfo.procedures.map((p, i) => <li key={i}>{p.replace(/-/g, '').trim()}</li>)}
            </ul>
        </div>
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-white mb-4">State Announcement Template</h3>
                <p className="bg-gray-800/50 p-4 rounded-md italic text-purple-300">"{coronerInfo.announcementTemplate}"</p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white mb-4">Mortician Practices</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                    {coronerInfo.morticianPractices.map((p, i) => <li key={i}>{p.replace(/-/g, '').trim()}</li>)}
                </ul>
            </div>
        </div>
    </div>
);

const GeneralProtocolsDisplay = () => (
    <div className="space-y-6">
        {generalProtocols.map(p => (
            <div key={p.title}>
                <h3 className="text-xl font-semibold text-white mb-2">{p.title}</h3>
                {Array.isArray(p.content) ? (
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {p.content.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                ) : (
                    <p className="text-gray-300">{p.content}</p>
                )}
            </div>
        ))}
        <div>
            <h3 className="text-xl font-semibold text-white mt-8 mb-4">Phonetic Alphabet</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(phoneticAlphabet).map(([letter, word]) => <div key={letter}>{letter} = {word}</div>)}
            </div>
        </div>
    </div>
);

export function SOPContent() {
    const [activeSection, setActiveSection] = useState('scope');

    const sections = [
        { id: 'scope', name: 'SAMS Rank Meanings', icon: 'heroicons:scale-16-solid' },
        { id: 'roster', name: 'Department Roster', icon: 'heroicons:users-16-solid' },
        { id: 'codes', name: '10-Codes', icon: 'heroicons:megaphone-16-solid' },
        { id: 'strikes', name: 'Strike System', icon: 'heroicons:exclamation-triangle-16-solid' },
        { id: 'coroner', name: 'Coroner Procedures', icon: 'heroicons:user-minus-16-solid' },
        { id: 'protocols', name: 'General Protocols', icon: 'heroicons:clipboard-document-list-16-solid' },
    ];

    const renderSection = () => {
        switch (activeSection) {
            case 'scope': return <ScopeOfPracticeTable />;
            case 'roster': return <RosterTable />;
            case 'codes': return <CodesList />;
            case 'strikes': return <StrikeSystem />;
            case 'coroner': return <CoronerProcedures />;
            case 'protocols': return <GeneralProtocolsDisplay />;
            default: return (
                <p className="text-sm text-gray-400">
                    No content available. This SOP may be in development or requires &quot;Whitelisted&quot; access.
                </p>
            );
        }
    };

    return (
        <>
            <div className="relative container mx-auto px-6 py-16">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-2xl shadow-purple-500/25">
                            <Icon icon="heroicons:book-open-16-solid" className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black text-white mb-4">
                        <span className="text-white">MASTERSHEET DATA</span>
                    </h1>
                    <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto mb-4">
                        Official EMS Department Guidelines • Last Updated: 06/22/2025
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Icon icon="heroicons:list-bullet-16-solid" className="h-5 w-5 text-purple-400" />
                                        Table of Contents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <nav className="space-y-1">
                                        {sections.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveSection(section.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${activeSection === section.id
                                                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                                                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                                                    }`}
                                            >
                                                <Icon icon={section.icon} className="h-4 w-4" />
                                                <span className="text-sm font-medium">{section.name}</span>
                                            </button>
                                        ))}
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <SectionCard title={sections.find(s => s.id === activeSection)?.name || ''} icon={sections.find(s => s.id === activeSection)?.icon || ''}>
                            {renderSection()}
                        </SectionCard>
                    </div>
                </div>
            </div>
        </>
    );
} 