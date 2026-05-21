# Manual Audit System - Quick Start Guide

**Status**: ✅ Ready to Use
**Last Updated**: January 15, 2024

---

## 🚀 Get Started in 60 Seconds

### Step 1: Go to Admin Page (10 seconds)
Open in your browser:
```
http://localhost:3000/admin/audit-testing
```

### Step 2: Select a Category (10 seconds)
- Click the checkbox for "PDF Tools" (or any category)
- See "1" selected in summary
- See "15 tests" total

### Step 3: Choose Mode (5 seconds)
- Select "Sequential" (default, recommended)
- Note: Lower CPU usage, safer

### Step 4: Start Testing (5 seconds)
- Click the blue "Start Audit" button
- Watch status change from "Pending" → "Running"

### Step 5: Monitor (30 seconds)
- Watch real-time progress in "Recent Audit Jobs"
- See test counts update
- Job completes in ~2 minutes

**Done!** You've successfully run your first audit.

---

## 📊 Available Categories

Choose from these 11 categories:

### Core Tools
- **PDF Tools** - 15 tests
- **Image Tools** - 12 tests
- **Video Tools** - 8 tests

### Specialized
- **Save From Online** - 5 tests
- **AI Writing Tools** - 10 tests
- **Data Conversion Tools** - 18 tests

### Utility
- **Data Tools** - 14 tests
- **Code Tools** - 9 tests
- **Financial Calculators** - 7 tests

### Creative
- **Resume Maker** - 6 tests
- **Text to Speech** - 4 tests

**Total: 108 tests available**

---

## 💡 Pro Tips

### Tip 1: Start Small
Run one category first to understand the interface:
```
1. Check "PDF Tools"
2. Click "Start Audit"
3. Wait for completion
4. Review results
```

### Tip 2: Use Select All for Full Suite
```
1. Click "Select All" button
2. Choose "Sequential" (safer)
3. Click "Start Audit"
4. Wait 15-20 minutes
5. Get comprehensive results
```

### Tip 3: Concurrent for Quick Check
```
1. Check 3 categories
2. Choose "Concurrent (up to 3)"
3. Click "Start Audit"
4. Wait 3-5 minutes
5. Results in parallel
```

### Tip 4: Monitor Resources
Watch VPS usage while tests run:
- **Sequential**: CPU 30-40%, Memory 200-300MB (safe)
- **Concurrent**: CPU 60-70%, Memory 300-350MB (higher)

### Tip 5: Stop if Needed
If a job looks stuck:
1. Find it in "Recent Audit Jobs"
2. Click "Stop" button
3. Job stops immediately
4. Start new audit

---

## 🎯 Common Scenarios

### Scenario 1: Daily PDF Tool Check
**Goal**: Quick health check on PDF tools
```
1. Uncheck all categories
2. Check only "PDF Tools"
3. Select "Sequential"
4. Start
5. Wait ~2 minutes
6. Review results
```
**Time**: 2-3 minutes

### Scenario 2: Full Comprehensive Test
**Goal**: Test everything
```
1. Click "Select All"
2. Leave "Sequential" selected
3. Start
4. Come back in 20 minutes
5. Review all results
```
**Time**: 15-20 minutes

### Scenario 3: Stress Testing
**Goal**: Check stability under load
```
1. Check 3 random categories
2. Switch to "Concurrent"
3. Start
4. Monitor CPU/memory
5. Wait for results
```
**Time**: 5-10 minutes

### Scenario 4: Performance Check
**Goal**: Quick performance baseline
```
1. Check 2 categories
2. Choose "Sequential"
3. Note start time
4. Click "Start"
5. Note completion time
6. Calculate metrics
```
**Time**: 4-6 minutes

---

## 📱 Interface Guide

### Left Panel: Category Selection
```
[✓] PDF Tools         15 tests
[✓] Image Tools       12 tests
[ ] Video Tools        8 tests
...
[Select All] [Clear]
```
- Checkboxes toggle categories
- "Select All" checks all 11
- "Clear" unchecks all
- Count shown for each category

### Right Panel: Summary
```
Categories Selected: 2
Total Tests: 27
Mode: Sequential
[Start Audit]
```
- Real-time count updates
- Shows selected mode
- Click to start

### Bottom: Recent Jobs
```
PDF Tools
Job: abc123... | Completed | 14/15 passed | 1.8s
[Status Badge]
```
- Shows job history
- Real-time status updates
- Stop button when running

---

## 🔧 Troubleshooting

### Job doesn't start
**Solution**:
1. Check Redis is running: `redis-cli ping`
2. Check worker running: `npm run dev`
3. Try again

### Status shows "Pending" forever
**Solution**:
1. Wait 30 seconds (startup time)
2. If still pending, click Stop
3. Restart worker
4. Try again

### High CPU usage
**Solution**:
1. Switch to Sequential mode
2. Reduce number of categories
3. Wait for other processes to finish
4. Try again

### No test results displayed
**Solution**:
1. Check test files exist: `ls tests/*.spec.ts`
2. Verify Playwright installed: `npx playwright --version`
3. Run `npm run build` to ensure compilation
4. Try one category first

### Worker crashes
**Solution**:
1. Restart: `npm run dev`
2. Check error logs in terminal
3. Wait 30 seconds
4. Try again

---

## 📈 Understanding Results

### Status Badges

🟡 **Pending**
- Job queued, waiting to start
- Click Stop to cancel

🔵 **Running** (pulsing)
- Job actively running
- Tests in progress
- Click Stop to halt

🟢 **Completed**
- Job finished successfully
- Results available
- Shows pass/fail counts

🔴 **Failed**
- Job encountered error
- Shows error message
- Safe to retry

### Result Display

```
PDF Tools
Job ID: abc123... • Started at 10:30 AM
Status: Completed
15/15 passed • 1.8s
```

- **Job ID**: Unique identifier
- **Passed/Total**: How many tests passed
- **Duration**: How long it took
- **Status**: Current state

---

## 🎓 Understanding Modes

### Sequential (Recommended)
```
Time: ========== (15-20 min total)
PDF:  [████]     (2-3 min)
Image:     [████] (1.5-2 min)
Video:         [████] (1-1.5 min)
...
```
- One category at a time
- Lower CPU (30-40%)
- Safer
- Easier to debug

### Concurrent (Up to 3)
```
Time: ===== (5-10 min total)
PDF:  [████]
Image:[████]
Video:[████]
(all running together)
```
- Up to 3 at once
- Higher CPU (60-70%)
- Faster
- More resource intensive

**Recommendation**: Use Sequential for daily checks, Concurrent for quick status.

---

## ⚡ Quick Commands

### From Terminal

View active jobs:
```bash
curl http://localhost:3000/api/admin/audit/manual-trigger/status
```

Start audit via API:
```bash
curl -X POST http://localhost:3000/api/admin/audit/manual-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["pdf-tools"],
    "sequential": true
  }'
```

Stop a job:
```bash
curl -X DELETE http://localhost:3000/api/admin/audit/manual-trigger/JOB_ID
```

---

## 📋 Checklist for First Run

- [ ] Redis running (`redis-cli ping`)
- [ ] Worker running (`npm run dev`)
- [ ] Navigate to `/admin/audit-testing`
- [ ] Select "PDF Tools" category
- [ ] Click "Start Audit"
- [ ] Wait for completion
- [ ] Review results
- [ ] Try another category
- [ ] Try "Select All"
- [ ] Celebrate! 🎉

---

## 🎯 Next Steps

### After First Audit
1. Read [MANUAL_AUDIT_SYSTEM.md](MANUAL_AUDIT_SYSTEM.md) for details
2. Try all 11 categories
3. Experiment with Concurrent mode
4. Monitor resource usage

### For Optimization
1. Review [PHASE_8_DATABASE_OPTIMIZATION_GUIDE.md]
2. Apply flaky test fixes from guides
3. Tune alert thresholds if needed
4. Monitor performance trends

### For Integration
1. Add result storage (optional)
2. Enable notifications (optional)
3. Create scheduled variant (optional)
4. Add export feature (optional)

---

## 💬 Quick FAQ

**Q: How do I stop a job?**
A: Find it in "Recent Audit Jobs" and click the "Stop" button.

**Q: Can I run all 11 at once?**
A: Concurrent mode limits to 3. Use Sequential for all 11 (~20 min).

**Q: What if I lose connection?**
A: Jobs keep running. Refresh page to see current status.

**Q: Do results get saved?**
A: Currently displayed in-memory. Can add persistence later.

**Q: Can I automate this?**
A: Yes, but manual control recommended first. Easy to add scheduling.

**Q: Which mode is best?**
A: Sequential for daily use, Concurrent for quick checks.

---

## 🚀 You're Ready!

Navigate to `/admin/audit-testing` and start your first audit now.

**Total setup time**: 5 minutes
**First audit time**: 2-3 minutes
**Ready to use**: Immediately

---

**Happy Testing!** 🎉

Questions? See [MANUAL_AUDIT_SYSTEM.md](MANUAL_AUDIT_SYSTEM.md) for comprehensive documentation.
