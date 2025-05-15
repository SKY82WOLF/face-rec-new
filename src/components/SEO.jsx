'use client'

import { useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

import { Helmet } from 'react-helmet-async'

const SEO = ({
  title = 'تشخیص چهره دیانا',
  description = 'تشخیص چهره دیاناالکترونیک کویر',
  keywords = 'تشخیص چهره, دیانا, سیستم امنیتی',
  author = 'دیانا الکترونیک کویر',
  ogTitle = '',
  ogDescription = '',
  ogType = 'website',
  ogImage = '/images/logo.png',
  twitterCard = 'summary_large_image'
}) => {
  // Using pathname as part of key for Helmet to force re-render on route change
  const pathname = usePathname()

  // Generate a unique key to force Helmet to update on route changes
  const helmetKey = `helmet-${pathname}-${Date.now()}`

  // Force component re-render on route change
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Set mounted to true on client side
    setMounted(true)

    // Force document title update immediately
    document.title = title

    // Update meta tags manually
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: author },
      { property: 'og:type', content: ogType },
      { property: 'og:title', content: ogTitle || title },
      { property: 'og:description', content: ogDescription || description },
      { property: 'og:image', content: ogImage },
      { property: 'twitter:card', content: twitterCard },
      { property: 'twitter:title', content: ogTitle || title },
      { property: 'twitter:description', content: ogDescription || description },
      { property: 'twitter:image', content: ogImage }
    ]

    // Update meta tags in the document head
    metaTags.forEach(tag => {
      let meta = document.querySelector(`meta[${tag.name ? 'name' : 'property'}="${tag.name || tag.property}"]`)

      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(tag.name ? 'name' : 'property', tag.name || tag.property)
        document.head.appendChild(meta)
      }

      meta.setAttribute('content', tag.content)
    })

    return () => {
      // Cleanup - not strictly necessary but good practice
    }
  }, [pathname, title, description, keywords, author, ogType, ogTitle, ogDescription, ogImage, twitterCard])

  if (!mounted) {
    return null
  }

  return (
    <Helmet key={helmetKey}>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name='title' content={title} />
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <meta name='author' content={author} />

      {/* Open Graph / Facebook */}
      <meta property='og:type' content={ogType} />
      <meta property='og:title' content={ogTitle || title} />
      <meta property='og:description' content={ogDescription || description} />
      <meta property='og:image' content={ogImage} />

      {/* Twitter */}
      <meta property='twitter:card' content={twitterCard} />
      <meta property='twitter:title' content={ogTitle || title} />
      <meta property='twitter:description' content={ogDescription || description} />
      <meta property='twitter:image' content={ogImage} />
    </Helmet>
  )
}

export default SEO
