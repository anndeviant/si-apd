"use client";

import { useCallback, useRef } from "react";

/**
 * Hook sederhana untuk menangani focus input pada mobile devices
 * Bekerja di semua browser dan device tanpa library tambahan
 */
export function useMobileInputFocus() {
    const inputRef = useRef<HTMLInputElement>(null);

    // Function untuk force focus dengan berbagai strategi
    const handleInputFocus = useCallback((e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
        e.stopPropagation();
        e.preventDefault();

        const input = e.currentTarget as HTMLInputElement;

        // Strategi 1: Focus langsung
        input.focus();

        // Strategi 2: Focus dengan requestAnimationFrame (untuk browser yang butuh rendering cycle)
        requestAnimationFrame(() => {
            input.focus();
        });

        // Strategi 3: Focus dengan setTimeout (untuk browser yang butuh event loop)
        setTimeout(() => {
            input.focus();
        }, 0);

        // Strategi 4: Focus dengan delay lebih lama (untuk device yang lambat)
        setTimeout(() => {
            input.focus();
        }, 10);

        // Strategi 5: Force click untuk trigger keyboard (iOS workaround)
        setTimeout(() => {
            input.click();
        }, 20);
    }, []);

    // Handler untuk touch events (mobile)
    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLInputElement>) => {
        handleInputFocus(e);
    }, [handleInputFocus]);

    // Handler untuk click events (desktop dan mobile)
    const handleClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
        handleInputFocus(e);
    }, [handleInputFocus]);

    // Handler untuk pointer events (universal)
    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLInputElement>) => {
        e.stopPropagation();

        const input = e.currentTarget as HTMLInputElement;

        // Multiple focus attempts untuk semua jenis pointer (mouse, touch, pen)
        input.focus();
        requestAnimationFrame(() => input.focus());
        setTimeout(() => input.focus(), 0);
        setTimeout(() => input.focus(), 10);
    }, []);

    // Handler untuk keyboard events
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();

        // Allow normal typing behavior
        if (e.key === "Escape") {
            e.currentTarget.blur();
        }
    }, []);

    // Handler untuk focus events
    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        e.stopPropagation();
    }, []);

    return {
        inputRef,
        inputProps: {
            ref: inputRef,
            style: { fontSize: '16px' }, // Prevent iOS zoom
            autoComplete: "off" as const,
            autoCorrect: "off" as const,
            autoCapitalize: "off" as const,
            spellCheck: false,
            inputMode: "text" as const,
            onTouchStart: handleTouchStart,
            onClick: handleClick,
            onPointerDown: handlePointerDown,
            onKeyDown: handleKeyDown,
            onFocus: handleFocus,
        },
    };
}