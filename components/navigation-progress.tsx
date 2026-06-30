"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearProgressTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startProgress = () => {
    clearProgressTimeout();
    setIsVisible(true);
    timeoutRef.current = setTimeout(() => setIsVisible(false), 6000);
  };

  const stopProgress = () => {
    clearProgressTimeout();
    timeoutRef.current = setTimeout(() => setIsVisible(false), 180);
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        isModifiedClick(event)
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        anchor.target ||
        anchor.hasAttribute("download") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      const nextUrl = new URL(href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;

      const currentUrl = new URL(window.location.href);
      const isSamePage =
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search;
      if (isSamePage) return;

      startProgress();
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearProgressTimeout();
    };
  }, []);

  useEffect(() => {
    stopProgress();
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden="true"
      className={`fixed left-0 top-0 z-[100] h-0.5 bg-primary transition-all duration-300 ${
        isVisible ? "w-full opacity-100" : "w-0 opacity-0"
      }`}
    />
  );
}
