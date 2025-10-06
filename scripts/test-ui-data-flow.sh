#!/bin/bash

# Test UI Data Flow
# Simulates what the frontend does when loading the dashboard

echo "🧪 Testing Complete UI Data Flow"
echo "================================"
echo ""

PARENT_ID="140834634"  # Christina Mock
CHILD_ID="140834636"   # Carter Mock

echo "📝 Step 1: Fetch parent and children"
echo "Endpoint: GET /api/parent/children"
echo ""
curl -s "http://localhost:9000/api/parent/children" \
  -H "Cookie: schoology_user_id=$PARENT_ID" \
  | python3 -m json.tool \
  | head -30
echo ""
echo "---"
echo ""

echo "📝 Step 2: Set active child"
echo "Endpoint: POST /api/parent/active"
echo ""
curl -s -X POST "http://localhost:9000/api/parent/active" \
  -H "Cookie: schoology_user_id=$PARENT_ID" \
  -H "Content-Type: application/json" \
  -d "{\"childId\":\"$CHILD_ID\"}" \
  | python3 -m json.tool
echo ""
echo "---"
echo ""

echo "📝 Step 3: Fetch courses for active child"
echo "Endpoint: GET /api/schoology/courses"
echo ""
curl -s "http://localhost:9000/api/schoology/courses" \
  -H "Cookie: schoology_user_id=$PARENT_ID" \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(json.dumps({'total_courses': len(data.get('courses', [])), 'sample_course': data['courses'][0] if data.get('courses') else None}, indent=2))"
echo ""
echo "---"
echo ""

echo "📝 Step 4: Fetch grades for active child"
echo "Endpoint: GET /api/schoology/grades"
echo ""
curl -s "http://localhost:9000/api/schoology/grades" \
  -H "Cookie: schoology_user_id=$PARENT_ID" \
  | python3 -m json.tool
echo ""
echo "---"
echo ""

echo "✅ Data flow test complete!"
echo ""
echo "If you see grades in Step 4, the complete flow is working!"
echo ""
