#!/bin/bash

# Complete Schoology Seeding Script
# Runs all seeding steps in the correct order

set -e  # Exit on any error

echo "🌱 Complete Schoology Seeding Process"
echo "======================================"
echo ""

echo "📝 Step 1: Creating assignments..."
node scripts/create-assignments-via-impersonation.js bulk
echo ""

echo "⚖️  Step 2: Updating grading category weights..."
node scripts/update-category-weights.js
echo ""

echo "🔗 Step 3: Assigning categories to assignments..."
node scripts/assign-categories-to-assignments.js
echo ""

echo "🎯 Step 4: Uploading grades..."
node scripts/import-grades-only.js
echo ""

echo "✅ Step 5: Verifying final grades..."
node scripts/show-all-student-grades.js
echo ""

echo "======================================"
echo "🎉 Seeding Complete!"
echo ""
echo "Next steps:"
echo "  1. Refresh your browser to see updated data"
echo "  2. Test the dashboard UI"
echo "  3. Verify grades appear correctly"
echo ""
