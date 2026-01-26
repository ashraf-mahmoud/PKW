'use client'

import { X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const AnnouncementBar = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-secondary text-secondary-foreground py-2.5 px-4 text-center text-sm font-medium relative">
            <Link href="/workshops" className="hover:underline">
                🎉 Holiday Workshops now open — limited spots available!{" "}
                <span className="text-primary font-semibold">Learn more →</span>
            </Link>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
                aria-label="Close announcement"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default AnnouncementBar;
