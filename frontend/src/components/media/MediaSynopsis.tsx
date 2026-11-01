import { Fragment, useMemo, type ReactNode } from 'react'

const renderNode = (node: Node, key: string): ReactNode => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.replace(/\u00a0/g, ' ') ?? ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const element = node as HTMLElement
  const tag = element.tagName.toLowerCase()
  if (['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math'].includes(tag)) return null

  const children = Array.from(element.childNodes).map((child, index) => renderNode(child, `${key}-${index}`))

  switch (tag) {
    case 'br':
      return <br key={key} />
    case 'p':
      return <p key={key} className="mb-4 last:mb-0">{children}</p>
    case 'b':
    case 'strong':
      return <strong key={key} className="font-semibold text-foreground-strong">{children}</strong>
    case 'i':
    case 'em':
      return <em key={key}>{children}</em>
    case 'ul':
      return <ul key={key} className="my-3 list-disc space-y-1 pl-5">{children}</ul>
    case 'ol':
      return <ol key={key} className="my-3 list-decimal space-y-1 pl-5">{children}</ol>
    case 'li':
      return <li key={key} className="pl-1">{children}</li>
    case 'blockquote':
      return <blockquote key={key} className="my-3 border-l-2 border-border/15 pl-4">{children}</blockquote>
    default:
      return <Fragment key={key}>{children}</Fragment>
  }
}

interface MediaSynopsisProps {
  synopsis: string
  className?: string
}

export const MediaSynopsis = ({ synopsis, className = 'mt-3 text-sm leading-7 text-muted sm:text-base' }: MediaSynopsisProps) => {
  const content = useMemo(() => {
    const parsed = new DOMParser().parseFromString(synopsis, 'text/html')
    return Array.from(parsed.body.childNodes).map((node, index) => renderNode(node, `synopsis-${index}`))
  }, [synopsis])

  return <div className={className}>{content}</div>
}
