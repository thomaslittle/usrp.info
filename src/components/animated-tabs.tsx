'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedTabsProps {
  publicContent: React.ReactNode;
  whitelistContent: React.ReactNode;
  defaultValue: string;
  className?: string;
}

export function AnimatedTabs({ publicContent, whitelistContent, defaultValue, className }: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={className}>
      <TabsList className="grid w-full grid-cols-2 sm:max-w-md sm:mx-auto mb-12 rounded-full">
        <TabsTrigger value="public" className="uppercase">Public</TabsTrigger>
        <TabsTrigger value="whitelist" className="uppercase">Whitelist</TabsTrigger>
      </TabsList>
      
      <AnimatePresence mode="wait">
        {activeTab === "public" && (
          <motion.div
            key="public"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {publicContent}
          </motion.div>
        )}
        {activeTab === "whitelist" && (
          <motion.div
            key="whitelist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {whitelistContent}
          </motion.div>
        )}
      </AnimatePresence>
    </Tabs>
  );
}