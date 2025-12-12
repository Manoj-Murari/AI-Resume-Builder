
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const AccordionItem = ({ icon: Icon, title, children, isExpanded, onToggle }) => (
    <div className="border-b border-slate-100 last:border-0">
        <button
            onClick={onToggle}
            className={clsx("w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors", isExpanded && "bg-slate-50")}
        >
            <div className="flex items-center gap-3">
                <Icon className={clsx("w-5 h-5", isExpanded ? "text-sky-600" : "text-slate-400")} />
                <span className={clsx("font-semibold text-sm", isExpanded ? "text-slate-800" : "text-slate-600")}>{title}</span>
            </div>
            <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-180")} />
        </button>
        <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-4 pt-0">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export default AccordionItem;
