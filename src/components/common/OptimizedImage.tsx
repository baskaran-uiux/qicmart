"use client"

import Image, { ImageProps } from "next/image"
import { useState, useEffect } from "react"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
    fallback?: string
    unoptimized?: boolean
}

export default function OptimizedImage({ 
    src, 
    alt, 
    className, 
    fallback = "/placeholder-image.png",
    unoptimized = false,
    ...props 
}: OptimizedImageProps) {
    // Ensure src is a valid type for next/image (string or object) and never an array
    const rawSrc = Array.isArray(src) ? src[0] : src;
    const isRemoteWithParams = typeof rawSrc === 'string' && rawSrc.includes('?');
    const [imgSrc, setImgSrc] = useState(rawSrc || fallback)
    const [error, setError] = useState(false)

    // Sync state when src prop changes
    useEffect(() => {
        const currentSrc = Array.isArray(src) ? src[0] : (src || fallback);
        setImgSrc(currentSrc)
        setError(false)
    }, [src, fallback])

    return (
        <Image
            src={error ? fallback : (imgSrc || fallback)}
            alt={alt || "Image"}
            className={className}
            unoptimized={unoptimized || isRemoteWithParams}
            onError={() => {
                if (!error) setError(true)
            }}
            {...props}
        />
    )
}
