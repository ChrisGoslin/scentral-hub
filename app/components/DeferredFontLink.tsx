'use client'

export default function DeferredFontLink() {
  return (
    <link
      href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
      rel="stylesheet"
      media="print"
      onLoad={(e) => {
        (e.currentTarget as HTMLLinkElement).media = 'all'
      }}
    />
  )
}
