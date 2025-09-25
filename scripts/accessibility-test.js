#!/usr/bin/env node
/**
 * Accessibility Validation Script for B767 Fleet Management
 * This script performs basic accessibility checks for the implementation
 */

console.log('🔍 B767 Fleet Management - Accessibility Validation');
console.log('====================================================');

const checks = [
  {
    name: 'Skip Links Implementation',
    file: 'src/components/ui/skip-links.tsx',
    expected: ['Skip to main content', 'Skip to navigation', 'Skip to critical alerts']
  },
  {
    name: 'Screen Reader Support',
    file: 'src/components/ui/sr-only.tsx',
    expected: ['SrOnly', 'LiveRegion', 'StatusAnnouncement']
  },
  {
    name: 'Accessibility Colors',
    file: 'src/lib/accessibility-colors.ts',
    expected: ['getAviationStatusColors', 'aviationAccessibilityUtils']
  },
  {
    name: 'Enhanced Navigation',
    file: 'src/components/ui/navigation.tsx',
    expected: ['aria-current', 'aria-label', 'focus:ring-2']
  }
];

const fs = require('fs');
const path = require('path');

let allPassed = true;

checks.forEach((check, index) => {
  console.log(`\n${index + 1}. ${check.name}`);

  const filePath = path.join(process.cwd(), check.file);

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      const missingFeatures = check.expected.filter(feature =>
        !content.includes(feature)
      );

      if (missingFeatures.length === 0) {
        console.log('   ✅ All features implemented');
      } else {
        console.log('   ❌ Missing features:', missingFeatures.join(', '));
        allPassed = false;
      }
    } else {
      console.log('   ❌ File not found');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Error reading file:', error.message);
    allPassed = false;
  }
});

// Check if documentation exists
console.log('\n5. Documentation');
const docPath = path.join(process.cwd(), 'ACCESSIBILITY.md');
if (fs.existsSync(docPath)) {
  console.log('   ✅ Accessibility documentation exists');
} else {
  console.log('   ❌ Documentation missing');
  allPassed = false;
}

// Check for CSS enhancements
console.log('\n6. CSS Accessibility Enhancements');
const cssPath = path.join(process.cwd(), 'src/app/globals.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const requiredCSS = ['.sr-only', '.skip-links', '@media (prefers-reduced-motion: reduce)'];

  const missingCSS = requiredCSS.filter(css => !cssContent.includes(css));

  if (missingCSS.length === 0) {
    console.log('   ✅ CSS accessibility features implemented');
  } else {
    console.log('   ❌ Missing CSS features:', missingCSS.join(', '));
    allPassed = false;
  }
} else {
  console.log('   ❌ CSS file not found');
  allPassed = false;
}

console.log('\n====================================================');
if (allPassed) {
  console.log('🎉 All accessibility implementations validated successfully!');
  console.log('\nNext steps:');
  console.log('1. Run the application: npm run dev');
  console.log('2. Test with keyboard navigation (Tab key)');
  console.log('3. Test with screen reader (NVDA, JAWS, or VoiceOver)');
  console.log('4. Validate color contrast with browser tools');
  console.log('5. Test mobile accessibility with touch devices');
} else {
  console.log('❌ Some accessibility implementations need attention.');
  console.log('Please check the items marked above and complete the implementation.');
  process.exit(1);
}

console.log('\n📚 For detailed testing procedures, see ACCESSIBILITY.md');