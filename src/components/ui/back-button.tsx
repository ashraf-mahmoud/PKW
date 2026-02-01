'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
    href?: string
    label?: string
    className?: string
}

export default function BackButton({ href, label = "Back", className }: BackButtonProps) {
    const router = useRouter()

    const handleClick = () => {
        if (href) {
            router.push(href)
        } else {
            router.back()
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className={cn("gap-1 pl-1 text-muted-foreground hover:text-foreground transition-colors mb-4", className)}
        >
            <ChevronLeft className="h-4 w-4" />
            {label}
        </Button>
    )
}
