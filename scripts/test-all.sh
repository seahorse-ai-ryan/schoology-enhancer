#!/bin/bash

# Run all E2E tests in sequence
# Each test is independent and uses persistent auth

echo "🧪 Running ALL E2E Tests"
echo "========================"
echo ""

# Test 1: Authentication (baseline)
echo "Running Test 1: Authentication..."
node scripts/test-authenticated.js
echo ""

# Test 2: Default Dashboard
echo "Running Test 2: Default Dashboard..."
node scripts/test-2-default-dashboard.js
echo ""

# Test 3: Child Switching
echo "Running Test 3: Child Switching..."
node scripts/test-3-child-switching.js
echo ""

# Test 4: Navigation
echo "Running Test 4: Navigation..."
node scripts/test-4-navigation.js
echo ""

# Test 5: Assignments & Grades
echo "Running Test 5: Assignments & Grades..."
node scripts/test-5-assignments-grades.js
echo ""

# Test 6: Data Sources
echo "Running Test 6: Data Sources..."
node scripts/test-6-data-sources.js
echo ""

# Test 7: Complete Flow
echo "Running Test 7: Complete Flow..."
node scripts/test-7-complete-flow.js
echo ""

echo "========================"
echo "✅ All tests complete!"
echo "Check test-results/ directory for screenshots"

