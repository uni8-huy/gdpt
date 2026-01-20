# Landing Page Patterns Research Report
**Date:** 2026-01-20 | **For:** UI/UX Improvements Planning

## Executive Summary
Modern community/nonprofit landing pages prioritize mobile-first responsive design, emotional storytelling, and strategically-placed CTAs. Key patterns focus on conversion optimization while maintaining accessibility.

## 1. Hero Section Best Practices

**Pattern Structure:**
- Single, clear value proposition answering "What's in it for me?" within 2 seconds
- One primary CTA + optional secondary (avoid choice overload)
- Hero visuals: video, authentic imagery, or subtle animations reinforcing message
- Trust badges/testimonials near CTA for credibility

**Tailwind Implementation:**
```tsx
// Hero: full-width container with responsive padding
<section className="relative w-full h-screen md:h-auto md:min-h-96 bg-gradient-to-r from-blue-600 to-blue-800">
  <div className="container mx-auto px-4 py-12 md:py-24 flex flex-col justify-center items-center text-center">
    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Single Value Proposition</h1>
    <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">Supporting statement</p>
    <div className="flex flex-col sm:flex-row gap-4">
      <Button>Primary CTA</Button>
      <Button variant="outline">Secondary CTA</Button>
    </div>
  </div>
</section>
```

## 2. Program/Class Showcase Cards

**Pattern:**
- 3-column grid (desktop) → 1-column stack (mobile, auto via Tailwind)
- Card: image + category tag + title + brief description + CTA
- 3D depth effects: subtle shadows on hover, slight tilt on interaction
- Equal text/media balance for context

**Implementation:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {programs.map(program => (
    <div className="group rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <img src={program.image} className="w-full h-48 object-cover group-hover:scale-105 transition" />
      <div className="p-6">
        <span className="text-xs font-semibold text-blue-600 uppercase">{program.category}</span>
        <h3 className="text-lg font-bold mt-2">{program.title}</h3>
        <p className="text-sm text-gray-600 mt-2">{program.description}</p>
        <Button className="mt-4 w-full">Learn More</Button>
      </div>
    </div>
  ))}
</div>
```

## 3. News/Announcement Display

**Pattern:**
- Recent post featured (large, prominent)
- 2-3 smaller recent items below
- Date badges, category tags, thumbnail images
- Modal for alerts/urgent announcements (non-intrusive)

**Layout Logic:**
```tsx
// Featured + Recent Posts Grid
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2 bg-white rounded-lg overflow-hidden shadow-md">
    {/* Featured post - larger */}
    <img className="w-full h-80 object-cover" />
    <div className="p-8">
      <Badge>{featured.category}</Badge>
      <h2 className="text-3xl font-bold mt-3">{featured.title}</h2>
      <p className="text-gray-600 mt-4">{featured.excerpt}</p>
      <Button className="mt-6">Read Full Article</Button>
    </div>
  </div>
  <div className="space-y-4">
    {/* Recent items - stacked */}
    {recentPosts.map(post => (
      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100">
        <span className="text-xs text-gray-500">{formatDate(post.date)}</span>
        <h4 className="font-semibold text-sm mt-2">{post.title}</h4>
      </div>
    ))}
  </div>
</div>
```

## 4. CTA Placement Strategy

**High-Conversion Locations:**
1. **Hero above fold** - immediate attention
2. **Sticky navigation** - visible during scroll (registration/login prominent)
3. **End of content sections** - engaged users signal
4. **Embedded in descriptions** - 121% conversion boost
5. **Community/social engagement section** - show active participation count

**Design Rules:**
- Use action verbs: "Join Today", "Register Now", "Start Learning"
- Add urgency language: "Limited spots available", "Sign up today"
- Registration/Login buttons in header: always visible, secondary styling
- Mobile: primary CTA button full-width on screens < 640px

**i18n Consideration:**
```tsx
<Button>{t('hero.register_button')}</Button>  // "Đăng ký" (vi) / "Register" (en)
<Button variant="outline">{t('hero.login')}</Button>
```

## 5. Mobile-First Responsive Patterns

**Breakpoint Strategy (Tailwind):**
- `sm: 640px` - basic tablet
- `md: 768px` - tablet layout
- `lg: 1024px` - desktop
- `xl: 1280px` - large desktop

**Key Mobile Optimization:**
- Stack all multi-column layouts to single column below `md`
- Touch targets minimum 44x44px for buttons
- Reduce padding/margins on mobile: use `py-4 md:py-8`
- Hide decorative elements on mobile: `hidden md:block`
- Video backgrounds → static image on mobile

```tsx
// Responsive text sizing
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold" />

// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" />

// Sticky CTA on mobile
<Button className="fixed sm:static bottom-4 left-4 right-4 sm:w-auto" />
```

## 6. Accessibility & Performance

**Standards:**
- Lighthouse 90+ on Core Web Vitals (LCP, FID, CLS)
- WCAG 2.1 AA compliance: color contrast ≥ 4.5:1
- Focus indicators on interactive elements
- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<button>`

**Next.js Optimization:**
- Server Components by default (faster initial render)
- Image optimization via `next/image`
- Dynamic imports for above-fold content
- Preload critical fonts

## Implementation Priority

1. **Phase 1:** Hero + primary CTA placement
2. **Phase 2:** Program showcase cards (grid layout)
3. **Phase 3:** News section + announcements
4. **Phase 4:** Mobile responsiveness polish + i18n validation
5. **Phase 5:** Accessibility audit + Core Web Vitals optimization

## Key Takeaways
- **Single focus:** One hero CTA wins over multiple
- **Authentic content:** Real community imagery > stock photos
- **Mobile dominance:** 52%+ traffic mobile; design mobile-first
- **3D subtlety:** Hover effects + shadows modernize without distraction
- **Sticky presence:** Keep registration/login always visible
- **Urgency + action verbs:** Boost conversions measurably

## Unresolved Questions
- Should hero video auto-play on mobile? (Performance vs. engagement tradeoff)
- Optimal announcement modal frequency? (Balance urgency vs. user annoyance)
- Community showcase: cards vs. carousel layout on mobile?

---
**Sources:**
- [Nonprofit Landing Page Best Practices](https://www.trajectorywebdesign.com/blog/nonprofit-landing-page-best-practices)
- [Hero Section Design Best Practices 2026](https://www.perfectafternoon.com/2025/hero-section-design/)
- [Mobile-First Development with Next.js](https://dev.to/muzammilrawjani/mobile-first-development-best-practices-with-nextjs-and-mobile-first-css-1526)
- [Card UI Design Patterns](https://ui-patterns.com/patterns/cards)
- [CTA Placement for High Conversions](https://captivateclick.com/blog/effective-cta-placement-for-high-conversion-websites)
