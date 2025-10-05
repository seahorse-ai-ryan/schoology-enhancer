# Integration Research Findings - Quick Assessment

**Created:** October 1, 2025  
**Purpose:** Initial research on ClassLink, Infinite Campus, and Schoology API freshness  
**Status:** Preliminary findings - needs deeper investigation

---

## 1. ClassLink + Schoology Authentication

### What We Know

**ClassLink is an SSO (Single Sign-On) provider** used by many school districts including Palo Alto USD.

**How It Works (General SSO Pattern):**
1. User goes to `https://login.classlink.com/my/pausd`
2. User logs in with ClassLink credentials
3. ClassLink authenticates user
4. ClassLink redirects to Schoology with authentication token
5. User is logged into Schoology

### What This Means For Us

**Our Current OAuth Flow:**
- User clicks "Sign in with Schoology"
- Redirects to Schoology OAuth page
- User logs in directly to Schoology
- Schoology redirects back to us with tokens

**With ClassLink Users:**
- They may not have direct Schoology credentials
- They go through ClassLink → Schoology
- **Question:** Can we initiate OAuth through ClassLink first?

### Status: **NEEDS DEEPER RESEARCH**

**Priority:** HIGH (critical for PAUSD)

**Action Items:**
1. Check Schoology developer docs for SSO/ClassLink integration guidance
2. Test with actual ClassLink account (need access to PAUSD test account)
3. Research if ClassLink has API for OAuth delegation
4. Determine if we need separate "Sign in with ClassLink" button

**Recommendation:**
- Week 1-2: Research Schoology docs + ClassLink docs
- Week 3: Get test account from PAUSD or friendly user
- Week 4: Test actual auth flow
- **May need to support both direct Schoology auth AND ClassLink → Schoology**

---

## 2. Infinite Campus API & Attendance

### What We Know

**Infinite Campus** is a Student Information System (SIS) used by many districts for:
- Attendance tracking
- Enrollment data
- Transcripts
- Scheduling

**The Problem:**
- Schoology theoretically supports attendance
- But many districts (including those in Bay Area) don't use Schoology for attendance
- They use Infinite Campus instead
- **Parents have to check two separate systems**

### API Availability - UNKNOWN

**Web search didn't find public API documentation.**

**Possible scenarios:**
1. **Public API exists:** Similar to Schoology, we can integrate
2. **Partner API only:** Need to become Infinite Campus partner
3. **PowerSchool owns both:** May have unified API (Schoology + Infinite Campus)
4. **No API:** Would need screen scraping (not viable)

### Status: **NEEDS DEEPER RESEARCH**

**Priority:** MEDIUM (huge value, but not all districts use it)

**Action Items:**
1. Check if PowerSchool (owner of both Schoology and Infinite Campus) has unified API
2. Research Infinite Campus partner program
3. Contact Infinite Campus developer relations (if they exist)
4. Ask friendly PAUSD parent: "How do you check attendance? Can you log in and take screenshots?"

**Recommendation:**
- **Phase 1 (Week 2-3):** Research if API exists and is accessible
- **Phase 2 (Week 4-5):** If API exists, understand auth model (same as Schoology? Different?)
- **Phase 3 (MVP+1):** Integrate if feasible
- **Fallback:** If no API, note as "future feature pending vendor cooperation"

**Value if we get this:**
- 🎯 **HUGE differentiator** - parents would love unified attendance view
- Could be marketing headline: "Finally see attendance and grades in one place"

---

## 3. Schoology API Freshness & Timestamps

### What We Need to Know

**Questions:**
1. Does Schoology API return "last modified" timestamps on data?
2. Is there a high-water mark we can check (e.g., "get all changes since timestamp X")?
3. How do we know if data has changed without refetching everything?

### Web Search: INCONCLUSIVE

**Need to check:**
- Schoology REST API v1 documentation directly
- Look at actual API responses for timestamp fields
- Test with real account

### Common API Freshness Patterns

**Pattern 1: Timestamp on each record**
```json
{
  "id": "12345",
  "title": "Biology Test",
  "last_updated": "2025-10-01T14:32:00Z"
}
```
→ We can check if `last_updated` changed

**Pattern 2: Global high-water mark**
```json
{
  "student_id": "98765",
  "last_sync": "2025-10-01T14:32:00Z",
  "changes": [...]
}
```
→ We can ask "what changed since 14:00:00?"

**Pattern 3: ETags (HTTP headers)**
```
ETag: "abc123xyz"
If-None-Match: "abc123xyz" → 304 Not Modified
```
→ Server tells us "nothing changed"

**Pattern 4: No freshness indicators**
→ We have to fetch everything every time and compare

### Status: **NEEDS SCHOOLOGY API DOC CHECK**

**Priority:** HIGH (affects our polling strategy)

**Action Items:**
1. **Week 1:** Deep dive into Schoology REST API v1 documentation
2. **Week 2:** Test actual API calls with Ryan's account or test account
3. **Week 2:** Document what timestamp fields exist
4. **Week 2:** Determine if we can do efficient "changed since X" queries

---

## 4. Recommended Polling/Refresh Strategy

### Based on Ryan's Requirements

**Ryan's Scenario:**
> "Student standing in front of teacher, asking them to update a grade, wants to see it quickly in Modern Teaching. Should not be faster to switch to Schoology."

**Implications:**
- Teacher updates grade in Schoology → Takes ~30 seconds
- Student refreshes Modern Teaching → Should see update within ~1 minute
- **Polling frequency needed: Once per minute during active session**

### Proposed Strategy

**During Active Session (User Has App Open):**
- Poll for updates: **Every 60 seconds**
- Show "Last updated: 45 seconds ago" timestamp
- User can pull-to-refresh for immediate check

**Why 60 seconds:**
- ✅ Fast enough for Ryan's scenario (see updates ~1 min after teacher posts)
- ✅ Respects Schoology API rate limits
- ✅ Doesn't drain battery on mobile
- ✅ Reasonable server load for our scale (500 users × 1 req/min = 500 req/min = manageable)

**When App is Backgrounded:**
- Stop polling
- Resume when app comes back to foreground
- Show cached data with "Last updated: 2 hours ago"

**Alternative: Exponential Backoff**
- First minute: Poll every 30 seconds (fast updates)
- After 5 minutes idle: Poll every 2 minutes (slower)
- After 15 minutes idle: Poll every 5 minutes (very slow)
- User interaction resets to 30-second polling

### Industry Standards

**Common refresh rates:**
- Email apps: 1-5 minutes
- Social media: 30 seconds - 2 minutes
- Banking apps: On-demand only (security)
- News apps: 5-15 minutes

**For grade data:** 1-minute polling is aggressive but reasonable given use case

---

## 5. Recommended Next Steps

### Immediate (Week 1)

**ClassLink Research:**
1. ✅ Read Schoology developer docs on SSO/authentication
2. ✅ Search for ClassLink OAuth integration guides
3. ✅ Determine if we need separate auth flow
4. 📋 Document findings

**Schoology API Deep Dive:**
1. ✅ Read REST API v1 docs thoroughly
2. ✅ Look for timestamp fields on: courses, assignments, grades, announcements
3. ✅ Test actual API responses
4. 📋 Document freshness strategy

**Infinite Campus:**
1. ✅ Check PowerSchool documentation for unified API
2. ✅ Research Infinite Campus partner/developer program
3. ✅ Determine feasibility
4. 📋 Mark as MVP+1 if complex, or fast-follow if easy

### Near-Term (Week 2-3)

**ClassLink:**
- Get test account from PAUSD user or district
- Test actual auth flow
- Implement if feasible, or add to post-MVP

**Polling Strategy:**
- Implement 60-second polling for active sessions
- Add "Last updated" timestamp to UI
- Add pull-to-refresh

**Infinite Campus:**
- If API is accessible, add to post-MVP roadmap
- If not accessible, add to "wishlist pending vendor support"

---

## 6. Summary & Recommendations

### ClassLink + Schoology Auth

**Status:** Needs deeper research  
**Priority:** HIGH (critical for PAUSD)  
**Timeline:** Research Week 1-2, Test Week 3-4  
**Risk:** May need to support two auth flows  
**Recommendation:** Research immediately, implement in MVP if feasible

---

### Infinite Campus Attendance

**Status:** Unknown if API exists  
**Priority:** MEDIUM (huge value, but not blocking MVP)  
**Timeline:** Research Week 2-3, assess feasibility  
**Risk:** May not have public API  
**Recommendation:** Research early, add to MVP+1 if viable, otherwise future feature

**Marketing Value:** If we get this, it's a major selling point - "unified view of grades AND attendance"

---

### Schoology API Freshness

**Status:** Need to check API docs  
**Priority:** HIGH (affects architecture)  
**Timeline:** Research Week 1  
**Recommendation:** 
- Deep dive into Schoology REST API docs immediately
- Test with real API calls
- Implement 60-second polling for active sessions
- Document what timestamp fields are available

**Polling Strategy:** Once per minute during active sessions is reasonable for the use case

---

## 7. Open Questions for Ryan

**Q1: ClassLink Access**
Do you have access to a PAUSD test account that uses ClassLink? Or know a friendly teacher/parent who could help us test?

**Q2: Infinite Campus Priority**
If Infinite Campus API is accessible but requires extra work, is it worth including in MVP or push to MVP+1?

**Q3: Polling Frequency**
Is 60-second polling during active sessions acceptable? Or do you want faster (30s) or slower (2 min)?

**Q4: Data Staleness UI**
Should we show "Last updated: X seconds ago" on every screen, or just in settings/debug?

---

**Research findings complete. Ready for deeper investigation during Week 1-2 of development.**


