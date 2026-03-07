'use client';

import React, { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = true,
}: ConfirmModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch {
            // Error handled by parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in px-4">
            <div className="bg-dark-900 border border-dark-700 max-w-sm w-full rounded-2xl p-6 shadow-2xl animate-scale-up">
                <div className={`p-3 rounded-full flex items-center justify-center w-fit mx-auto mb-4 ${isDanger ? 'bg-red-500/10 text-red-400' : 'bg-primary-500/10 text-primary-400'
                    }`}>
                    <FiAlertTriangle className="w-8 h-8" />
                </div>

                <h2 className="text-xl font-bold text-white text-center mb-2">{title}</h2>
                <p className="text-dark-400 text-center text-sm mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 btn-ghost rounded-xl py-3 order-2 sm:order-1"
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`flex-1 rounded-xl py-3 font-semibold transition-all transform active:scale-95 order-1 sm:order-2 ${isDanger
                                ? 'bg-red-500 hover:bg-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.3)] text-white'
                                : 'bg-primary-500 hover:bg-primary-600 shadow-[0_4px_12px_rgba(37,99,235,0.3)] text-white'
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Processing...
                            </div>
                        ) : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
