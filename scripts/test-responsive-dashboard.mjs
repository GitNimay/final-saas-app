import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const app = readFileSync('App.tsx', 'utf8');
const validation = readFileSync('components/tabs/ValidationTab.tsx', 'utf8');
const deepAnalysis = readFileSync('components/tabs/DeepAnalysisTab.tsx', 'utf8');
const transition = readFileSync('components/ui/PageTransition.tsx', 'utf8');
const html = readFileSync('index.html', 'utf8');

assert.match(app, /dashboardNavItems\s*=\s*useMemo/, 'dashboard nav items should be shared between desktop and mobile UI');
assert.match(app, /handleSelectDashboardTab/, 'dashboard tab selection should close mobile surfaces cleanly');
assert.match(app, /aria-label=\{`Open \$\{item\.label\} tab`\}/, 'mobile tab rail should expose accessible tab labels');
assert.match(app, /overscroll-contain/, 'dashboard scroll container should contain mobile overscroll');
assert.match(app, /pb-\[calc\(5rem\+env\(safe-area-inset-bottom\)\)\]/, 'dashboard content should leave safe space for mobile controls');

assert.match(validation, /const cardClass =/, 'validation cards should use a shared responsive card class');
assert.match(validation, /const chartCardClass =/, 'chart cards should use responsive chart sizing');
assert.match(validation, /expenseRatio/, 'profit metrics should avoid NaN widths when revenue is zero');
assert.match(validation, /samShare/, 'market size bars should avoid NaN widths when TAM is zero');
assert.match(validation, /break-words/, 'dashboard text should wrap on narrow screens');
assert.match(validation, /h-\[180px\] sm:h-\[220px\]/, 'secondary charts should scale by viewport size');

assert.match(deepAnalysis, /const chartShellClass =/, 'deep analysis charts should use explicit responsive chart shells');
assert.match(deepAnalysis, /hasMarketTrendData/, 'market pulse chart should guard empty trend data');
assert.match(deepAnalysis, /hasProjectedMrrData/, 'MRR chart should guard empty projection data');
assert.match(deepAnalysis, /No chart data available/, 'empty deep analysis charts should render a visible fallback');
assert.match(deepAnalysis, /h-\[220px\] sm:h-\[260px\]/, 'deep analysis chart shells should have definite mobile heights');
assert.match(deepAnalysis, /stroke="var\(--foreground\)"/, 'deep analysis trend lines should use foreground color instead of globally-muted chart hex colors');
assert.match(deepAnalysis, /fill="var\(--foreground\)"/, 'deep analysis bars should use foreground color instead of globally-muted chart hex colors');

assert.doesNotMatch(transition, /filter:\s*'blur/, 'page transitions should avoid expensive blur filters');
assert.match(transition, /duration = 0\.28/, 'page transitions should use a faster default duration');

assert.match(html, /prefers-reduced-motion: reduce/, 'global styles should respect reduced motion preferences');
assert.doesNotMatch(html, /\.recharts-responsive-container,\s*\.recharts-wrapper\s*\{[\s\S]*?max-width:\s*100%/, 'mobile CSS should not clamp Recharts wrapper width to zero');

console.log('Responsive dashboard checks passed');
