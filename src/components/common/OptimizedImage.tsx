"use client"

import Image, { ImageProps } from "next/image"
import { useState } from "react"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
    fallback?: string
}

export default function OptimizedImage({ 
    src, 
    alt, 
    className, 
    fallback = "/placeholder-image.png",
    ...props 
}: OptimizedImageProps) {
    const [imgSrc, setImgSrc] = useState(src)
    const [error, setError] = useState(false)

    return (
        <Image
            src={error ? fallback : imgSrc}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            {...props}
        />
    )
}
