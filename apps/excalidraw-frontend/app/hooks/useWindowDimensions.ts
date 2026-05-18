"use client";

import { useEffect, useState } from "react";

export function useWindowDimensions() {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const update = () =>
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    return dimensions;
}
