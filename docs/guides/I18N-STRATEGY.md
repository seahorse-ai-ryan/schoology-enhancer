# i18n (Internationalization) Strategy Investigation

**Created:** October 1, 2025  
**Purpose:** Investigate i18n options and impact on schema/state management  
**Priority:** HIGH (affects architecture decisions)  
**Status:** Initial investigation - needs deeper analysis

---

## The Problem

**Ryan's Concern:**
> "Getting i18n right is key because it could significantly affect our schema and state management if users switch languages and we need to generate and store translated values for our form fields."

**Questions to Answer:**
1. How do we handle UI text translation (buttons, labels, etc.)?
2. How do we handle Schoology data translation (course names, assignment titles)?
3. What happens when a user switches language?
4. Where do we store translations?
5. How does this affect our database schema?

---

## Two Types of Translation

### Type 1: UI Translation (Straightforward)

**What:** App interface text (buttons, labels, headings, etc.)

**Examples:**
- English: "Dashboard", "Courses", "Assignments", "Due Date"
- Spanish: "Panel", "Cursos", "Tareas", "Fecha de Vencimiento"
- Mandarin: "仪表板", "课程", "作业", "截止日期"

**How It Works:**
- Store translation files (JSON or similar)
- User selects language
- App loads correct translations
- UI updates instantly

**Impact on Schema:** NONE - just text substitution

---

### Type 2: Schoology Data Translation (Complex)

**What:** User-generated content from Schoology

**Examples:**
- Course title: "AP Biology - Period 3"
- Assignment: "Essay on Photosynthesis"
- Announcement: "Test moved to Friday"

**The Challenge:**
- This content is in English (or whatever language teacher wrote it)
- To show in Spanish, we need to translate it
- Translation costs money (Google Translate API, etc.)
- Translation isn't instant
- Where do we store translated versions?

**Impact on Schema:** SIGNIFICANT - need to store multiple language versions

---

## Type 1: UI Translation (Easy Part)

### Next.js i18n Options

#### Option A: next-intl (Recommended)

**What It Is:** Modern i18n library for Next.js App Router

**How It Works:**
```
/locales/en.json
{
  "dashboard": "Dashboard",
  "courses": "Courses",
  "due_date": "Due Date"
}

/locales/es.json
{
  "dashboard": "Panel",
  "courses": "Cursos",
  "due_date": "Fecha de Vencimiento"
}

/locales/zh.json
{
  "dashboard": "仪表板",
  "courses": "课程",
  "due_date": "截止日期"
}
```

In components:
```typescript
const t = useTranslations();
return <h1>{t('dashboard')}</h1>
// English → "Dashboard"
// Spanish → "Panel"
```

**Pros:**
- ✅ Works great with Next.js 15 App Router
- ✅ Simple to implement (1-2 days)
- ✅ No schema changes needed
- ✅ Lightweight (small bundle size)
- ✅ Supports plurals, variables, etc.

**Cons:**
- ⚠️ Manual translation of all UI strings
- ⚠️ Need to maintain translation files

---

#### Option B: next-i18next

**What It Is:** Older, more established i18n library

**Pros:**
- ✅ Very mature, lots of features
- ✅ Large community

**Cons:**
- ⚠️ Designed for Pages Router, not App Router
- ⚠️ More complex setup
- ⚠️ Heavier bundle size

**Recommendation:** Use next-intl for App Router

---

### UI Translation Strategy for MVP

**Languages to Support:**
- English (primary)
- Spanish (Bay Area has significant Spanish-speaking population)
- Mandarin Chinese (Bay Area)

**Implementation Plan:**
1. Install next-intl
2. Create translation files for 3 languages
3. Add language selector in Settings
4. Store user's language preference (user-level in Firestore)
5. All UI text goes through translation function

**Timeline:** 1-2 days to set up, ongoing to translate all strings

**Schema Impact:** Just one field: `user.preferences.language: "en" | "es" | "zh"`

---

## Type 2: Schoology Data Translation (Hard Part)

### The Challenge

**Schoology Data is User-Generated:**
- Course: "AP Biology - Period 3"
- Assignment: "Read Chapter 5 and answer questions 1-10"
- Announcement: "Test postponed due to assembly"

**To translate this:**
1. Need translation service (Google Translate API, DeepL, etc.)
2. Costs money per character
3. Takes time (API call)
4. Quality varies
5. Need to store results

---

### Storage Strategies

#### Option A: Generate on Demand (Simple, Expensive)

**How It Works:**
1. User switches to Spanish
2. For each piece of text, call translation API
3. Show translated text
4. Don't store it

**Pros:**
- ✅ No schema changes
- ✅ Always fresh (if source text changes, re-translate)

**Cons:**
- ❌ Expensive (pay for every translation, every time)
- ❌ Slow (API calls for everything)
- ❌ 500 users switching languages = huge costs

---

#### Option B: Cache Translations in Firestore

**How It Works:**
1. User switches to Spanish
2. Check if we've already translated this text
3. If yes: Use cached translation
4. If no: Call API, cache result, show it

**Schema:**
```
/translations/{textId}
  source_text: "AP Biology - Period 3"
  source_lang: "en"
  translations: {
    es: "Biología AP - Período 3"
    zh: "AP 生物 - 第 3 节"
  }
  translated_at: timestamp
```

**Pros:**
- ✅ Much cheaper (translate once, use many times)
- ✅ Fast after first translation
- ✅ Multiple users benefit from cached translations

**Cons:**
- ⚠️ Schema change (new `translations` collection)
- ⚠️ Storage costs (but cheap)
- ⚠️ Stale translations if source text edited (rare)

---

#### Option C: Pre-translate Common Text

**How It Works:**
- For common strings (course names, assignment types), pre-translate
- Store in our database
- Only translate unique text on demand

**Pros:**
- ✅ Cheapest
- ✅ Fastest for common text

**Cons:**
- ⚠️ Manual work to identify "common" text
- ⚠️ Still need on-demand for unique text

---

### Recommended Schoology Data Strategy

**For MVP:**
1. **UI translation only** (English, Spanish, Mandarin UI)
2. **No Schoology data translation** (show in original language)
3. **Defer** data translation to post-MVP

**Rationale:**
- Schoology data is mostly in English (teacher-written)
- Translation costs add up quickly
- Most target users (Bay Area) read English
- Can add data translation in MVP+1 if users request it

**Post-MVP (If Requested):**
- Implement caching strategy (Option B)
- Use Google Translate API or DeepL
- Cost estimate: $0.01-0.05 per user per month

---

## Impact on State Management

### If We Only Do UI Translation (MVP)

**Global State Needed:**
- Current language: "en" | "es" | "zh"

**State Management:**
- Add to Zustand store: `language: string`
- When user switches language:
  - Update state
  - React re-renders with new translations
  - Save preference to Firestore

**Complexity:** LOW - just one more piece of global state

---

### If We Do Data Translation (Post-MVP)

**Global State Needed:**
- Current language
- Translation cache (or fetch from Firestore as needed)

**State Management:**
- Zustand handles current language
- SWR handles fetching translations from Firestore
- When user switches language:
  - Update Zustand state
  - SWR refetches data with language parameter
  - Show translations if available, original if not

**Complexity:** MEDIUM - but manageable with our architecture

---

## Schema Impact

### For UI Translation Only (MVP)

**User Schema:**
```typescript
/users/{userId}
  preferences: {
    language: "en" | "es" | "zh"  // ← Just this one field
  }
```

**Impact:** Minimal - one field added

---

### For Data Translation (Post-MVP)

**New Collection:**
```typescript
/translations/{hash_of_source_text}
  source_text: string
  source_lang: string
  translations: {
    es: string
    zh: string
    // ... other languages
  }
  translated_at: timestamp
  usage_count: number  // Track which translations are popular
```

**Impact:** Moderate - new collection, but doesn't affect existing schema

---

## Recommended MVP Strategy

### Week 1-2: Set Up UI Translation

**Implement:**
1. Install next-intl
2. Create translation files (en.json, es.json, zh.json)
3. Add language selector in Settings
4. Store user language preference in Firestore
5. Add to Zustand store

**Deliverable:** Users can switch UI language, all buttons/labels/headings translate

**Time:** 1-2 days (quick!)

**Schema Change:** Add `user.preferences.language` field

---

### MVP: No Data Translation

**Show Schoology data in original language**

**Why:**
- Most content is in English anyway
- Significant cost and complexity to translate
- Target users (Bay Area) typically read English
- Can add later if users request it

**Exception:** If a Spanish-speaking teacher writes assignments in Spanish, they'll show in Spanish (original language preserved)

---

### Post-MVP: Optional Data Translation

**If users request it:**
1. Implement caching strategy
2. Use Google Translate API or DeepL
3. Budget ~$0.01-0.05 per active user per month
4. Add UI toggle: "Translate content"

---

## Cost Estimates

### UI Translation: FREE
- Translation files maintained by us
- No API costs
- Just development time (1-2 days)

### Data Translation (If We Add It):

**Google Translate API Pricing:**
- $20 per 1 million characters
- Average student might have:
  - 10 courses × 100 chars = 1,000 chars
  - 50 assignments × 200 chars = 10,000 chars
  - 20 announcements × 300 chars = 6,000 chars
  - **Total: ~17,000 characters**
- Cost per student (one-time): $0.34
- Cost per student (with caching, only translate new content): <$0.05/month

**At Scale:**
- 500 users × $0.05/month = $25/month
- Affordable, but adds up

---

## Recommendation Summary

### For MVP (Next 12 Weeks):

**DO:**
- ✅ Implement UI translation (English, Spanish, Mandarin)
- ✅ Use next-intl library
- ✅ Add language selector in Settings
- ✅ Store language preference in Zustand + Firestore
- ✅ Schema change: Add `user.preferences.language` field

**DON'T:**
- ❌ Translate Schoology data (show in original language)
- ❌ Add translation API costs
- ❌ Add translation caching infrastructure

**Timeline:** 1-2 days in Week 2-3

**Risk:** LOW - straightforward implementation

---

### For Post-MVP (If Requested):

**IF users want Schoology data translation:**
1. Add "Translate content" toggle in Settings
2. Implement caching strategy (translations collection)
3. Use Google Translate API
4. Budget $25-50/month for 500 users
5. Timeline: 3-5 days to implement

---

## Open Questions for Ryan

**Q1: MVP Language Support**
Are English, Spanish, and Mandarin the right three languages for Bay Area? Any others needed?

**Q2: Data Translation Priority**
Do you think users will request Schoology data translation, or is UI translation enough?

**Q3: Default Language**
Should we auto-detect browser language, or always default to English?

**Q4: Language Switching**
Should language switch require app reload, or instant (more complex)?

---

## Next Steps

**This Week:**
1. Get Ryan's answers to questions above
2. Create detailed implementation plan for UI translation
3. Set up next-intl in Week 2 of MVP development
4. Create translation files (start with English, add Spanish/Mandarin as we go)

**Schema Impact:** Minimal - just `user.preferences.language` field

**State Management Impact:** Minimal - just one more piece of global state in Zustand

---

**i18n strategy investigation complete. Ready for implementation planning.**


