'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedTabsContent = ({ value, children }: { value: string; children: React.ReactNode }) => {
  return (
    <TabsContent value={value} asChild>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full"
      >
        {children}
      </motion.div>
    </TabsContent>
  );
};

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  const departmentSections = {
    lspd: [
      { icon: "heroicons:document-text-16-solid", label: "SOPs", color: "text-blue-400" },
      { icon: "heroicons:megaphone-16-solid", label: "10-Codes", color: "text-blue-400" },
      { icon: "heroicons:clipboard-document-list-16-solid", label: "Protocols", color: "text-blue-400" },
      { icon: "heroicons:user-group-16-solid", label: "Roster", color: "text-blue-400" }
    ],
    bcso: [
      { icon: "heroicons:document-text-16-solid", label: "SOPs", color: "text-orange-400" },
      { icon: "heroicons:megaphone-16-solid", label: "10-Codes", color: "text-orange-400" },
      { icon: "heroicons:clipboard-document-list-16-solid", label: "Protocols", color: "text-orange-400" },
      { icon: "heroicons:user-group-16-solid", label: "Roster", color: "text-orange-400" }
    ]
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <img
        src="/images/bg.webp"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>

      {/* Hero Section */}
      <div className="relative">
        {/* Hero Content */}
        <div className="relative px-6 py-18">
          <div className="container mx-auto max-w-6xl">
            {/* Hero Text */}
            <div className="text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src="/images/wordmark.webp"
                    alt="PENTA UNTITLED PROJECT RP RP"
                    className="w-96 object-contain filter drop-shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl rounded-full"></div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative pb-20" id="departments">
        <div className="container mx-auto px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 glow-text">
              Department Portal
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Comprehensive resources and tools for EMS, LSPD, BCSO and DOJ.
            </p>
          </div>

          <Tabs defaultValue="public" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:max-w-md sm:mx-auto mb-12 rounded-full">
              <TabsTrigger value="public" className="uppercase">Public</TabsTrigger>
              <TabsTrigger value="whitelist" className="uppercase">Whitelist</TabsTrigger>
            </TabsList>
            <AnimatePresence mode="wait">
              <AnimatedTabsContent key="public" value="public">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">

                  {/* EMS Department - Active */}
                  <div className="group hover-lift">
                    <Card className="stat-card h-full border-0 overflow-hidden flex flex-col">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <CardHeader className="relative pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                            <Icon icon="heroicons:heart-16-solid" className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-400 font-semibold">ACTIVE</span>
                          </div>
                        </div>

                        <CardTitle className="text-2xl font-bold text-white mb-2">
                          EMS
                        </CardTitle>
                        <p className="text-sm text-purple-300 font-semibold tracking-wide">
                          EMS/TacMed Department
                        </p>
                      </CardHeader>

                      <CardContent className="relative flex flex-col flex-grow">
                        <div className="flex-grow">
                          <p className="text-slate-300 leading-relaxed">
                            Advanced medical protocols, emergency response procedures, communication systems, and staff management tools.
                          </p>

                          <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                            {[
                              { icon: "heroicons:document-text-16-solid", label: "SOPs", color: "text-purple-400" },
                              { icon: "heroicons:megaphone-16-solid", label: "10-Codes", color: "text-purple-400" },
                              { icon: "heroicons:clipboard-document-list-16-solid", label: "Protocols", color: "text-purple-400" },
                              { icon: "heroicons:user-group-16-solid", label: "Roster", color: "text-purple-400" }
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center text-slate-300 font-medium hover:text-white transition-colors">
                                <Icon icon={item.icon} className={`h-4 w-4 mr-2 ${item.color}`} />
                                {item.label}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4 pt-6 mt-auto">
                          <Link href="/ems" className="block">
                            <Button className="w-full bg-gradient-to-r cursor-pointer from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 shadow-lg hover:shadow-xl font-semibold rounded-xl transition-all duration-300">
                              <Icon icon="heroicons:arrow-right-16-solid" className="mr-2 h-4 w-4" />
                              Access Portal
                            </Button>
                          </Link>

                          <div className="grid grid-cols-2 gap-3">
                            <Link href="/ems/sops">
                              <Button variant="outline" size="sm" className="w-full glass-effect border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 font-medium rounded-lg transition-all duration-300">
                                SOPs
                              </Button>
                            </Link>
                            <Link href="/ems">
                              <Button variant="outline" size="sm" className="w-full glass-effect border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 font-medium rounded-lg transition-all duration-300">
                                Guides
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* LSPD - Coming Soon */}
                  <div className="group hover-lift opacity-60">
                    <Card className="stat-card h-full border-0 overflow-hidden flex flex-col">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5"></div>

                      <CardHeader className="relative pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                            <Icon icon="heroicons:shield-check-16-solid" className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-yellow-400 font-semibold">SOON</span>
                          </div>
                        </div>

                        <CardTitle className="text-2xl font-bold text-white mb-2">
                          LSPD
                        </CardTitle>
                        <p className="text-sm text-blue-300 font-semibold tracking-wide">
                          LSPD Operations
                        </p>
                      </CardHeader>

                      <CardContent className="relative flex flex-col flex-grow">
                        <div className="flex-grow">
                          <p className="text-slate-400 leading-relaxed">
                            Law enforcement procedures, patrol protocols, investigation guidelines, and departmental management systems.
                          </p>

                          <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                            {departmentSections.lspd.map((item, idx) => (
                              <div key={idx} className="flex items-center text-slate-500 font-medium">
                                <Icon icon={item.icon} className={`h-4 w-4 mr-2 ${item.color}`} />
                                {item.label}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button disabled className="w-full bg-slate-700/50 text-slate-400 cursor-not-allowed font-medium rounded-xl mt-auto">
                          <Icon icon="heroicons:clock-16-solid" className="mr-2 h-4 w-4" />
                          Coming Soon
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* BCSO - Coming Soon */}
                  <div className="group hover-lift opacity-60">
                    <Card className="stat-card h-full border-0 overflow-hidden flex flex-col">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-600/5"></div>

                      <CardHeader className="relative pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                            <Icon icon="heroicons:shield-exclamation-16-solid" className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-yellow-400 font-semibold">SOON</span>
                          </div>
                        </div>

                        <CardTitle className="text-2xl font-bold text-white mb-2">
                          BCSO
                        </CardTitle>
                        <p className="text-sm text-orange-300 font-semibold tracking-wide">
                          BCSO Operations
                        </p>
                      </CardHeader>

                      <CardContent className="relative flex flex-col flex-grow">
                        <div className="flex-grow">
                          <p className="text-slate-400 leading-relaxed">
                            County law enforcement, specialized units, rural patrol protocols, and sheriff department administration.
                          </p>

                          <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                            {departmentSections.bcso.map((item, idx) => (
                              <div key={idx} className="flex items-center text-slate-500 font-medium">
                                <Icon icon={item.icon} className={`h-4 w-4 mr-2 ${item.color}`} />
                                {item.label}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button disabled className="w-full bg-slate-700/50 text-slate-400 cursor-not-allowed font-medium rounded-xl mt-auto">
                          <Icon icon="heroicons:clock-16-solid" className="mr-2 h-4 w-4" />
                          Coming Soon
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* DOJ */}
                  <div className="group hover-lift opacity-60">
                    <Card className="stat-card h-full border-0 overflow-hidden flex flex-col">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-600/5"></div>

                      <CardHeader className="relative pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-4 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl shadow-lg">
                            <Icon icon="heroicons:building-library-16-solid" className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-yellow-400 font-semibold">SOON</span>
                          </div>
                        </div>

                        <CardTitle className="text-2xl font-bold text-white mb-2">
                          DOJ
                        </CardTitle>
                        <p className="text-sm text-slate-300 font-semibold tracking-wide">
                          Department of Justice
                        </p>
                      </CardHeader>

                      <CardContent className="relative flex flex-col flex-grow">
                        <div className="flex-grow">
                          <p className="text-slate-400 leading-relaxed">
                            Legal frameworks, court procedures, case law repository, and official judicial documentation.
                          </p>

                          <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                            {[
                              { icon: "heroicons:scale-16-solid", label: "Laws", color: "text-slate-400" },
                              { icon: "heroicons:gavel-16-solid", label: "Case Law", color: "text-slate-400" },
                              { icon: "heroicons:book-open-16-solid", label: "Statutes", color: "text-slate-400" },
                              { icon: "heroicons:user-group-16-solid", label: "Members", color: "text-slate-400" }
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center text-slate-500 font-medium">
                                <Icon icon={item.icon} className={`h-4 w-4 mr-2 ${item.color}`} />
                                {item.label}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button disabled className="w-full bg-slate-700/50 text-slate-400 cursor-not-allowed font-medium rounded-xl mt-auto">
                          <Icon icon="heroicons:clock-16-solid" className="mr-2 h-4 w-4" />
                          Coming Soon
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </AnimatedTabsContent>
              <AnimatedTabsContent key="whitelist" value="whitelist">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white">Whitelist Access</h3>
                  <p className="text-slate-400">Content for whitelist server coming soon.</p>
                </div>
              </AnimatedTabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
