"use client"

import { useEffect } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        let locomotiveScroll: any;
        
        if (window.innerWidth >= 1024) {
            (async () => {
                const LocomotiveScroll = (await import('locomotive-scroll')).default;
                locomotiveScroll = new LocomotiveScroll();
            })();
        }

        return () => {
            if (locomotiveScroll) locomotiveScroll.destroy();
        }
    }, []);

    return (
        <>
            {children}
        </>
    );
}
