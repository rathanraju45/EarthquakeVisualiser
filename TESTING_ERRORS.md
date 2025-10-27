# Quick Start: Testing Error Handling

## 🚀 Quick Test (30 seconds)

### Method 1: Use Browser DevTools (Recommended)

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Open in browser:** http://localhost:3000

3. **Open DevTools:** Press `F12` or Right-click → Inspect

4. **Test Network Error:**
   - Go to **Network** tab
   - Change dropdown from "No throttling" to **"Offline"**
   - Click the **"Refresh"** button in the app
   - ✅ You should see a **yellow error banner** with:
     - Message: "Network error. Please check your internet connection."
     - Error Code: NETWORK_ERROR
     - **"Try Again"** button

5. **Test Retry:**
   - Change DevTools back to **"No throttling"** (online)
   - Click **"Try Again"** button
   - ✅ Error should disappear and data should load

6. **Test 404 Error:**
   - Keep DevTools **Network** tab open
   - Right-click on any USGS request
   - Select **"Block request URL"**
   - Click **"Refresh"** in the app
   - ✅ You should see an error (may appear as network error or timeout)

---

## 🔧 Method 2: Use Error Simulator Button (Development Mode)

When you run `npm start`, you'll see a **purple button** in the **bottom-left corner**:

```
🔧 Test Errors
```

**Click it** to open the Error Simulator panel with these options:

1. **🌐 Network Error** - Simulates connection failure
2. **⏱️ Timeout** - Simulates slow/timeout (takes 20s)
3. **❌ 404 Not Found** - Simulates missing resource
4. **⚙️ 500 Server Error** - Instructions for manual simulation
5. **🚫 429 Rate Limit** - Instructions for manual simulation
6. **📴 Offline Mode** - Instructions for DevTools setup
7. **📋 Invalid Data** - Instructions for code modification

### Steps:
1. Click **"🔧 Test Errors"** button (bottom-left)
2. Click any error type
3. Watch the error banner appear
4. Test the **"Try Again"** button
5. Test the **"Dismiss"** (X) button

---

## 📋 Visual Checklist

After simulating errors, verify these UI elements:

### ✅ Error Banner Should Show:
- [ ] Error icon (⚠️ warning for retryable, ❌ error for others)
- [ ] Error title ("Temporary Error" or "Error")
- [ ] Error message (user-friendly text)
- [ ] Error code (e.g., "Error Code: NETWORK_ERROR")
- [ ] Correct background color (yellow for retryable, red for non-retryable)

### ✅ For Retryable Errors:
- [ ] "Try Again" button appears
- [ ] Button shows spinner when clicked
- [ ] Button is disabled during retry
- [ ] Error clears on successful retry

### ✅ For All Errors:
- [ ] Dismiss button (X) appears in top-right
- [ ] Clicking dismiss clears the error
- [ ] Error appears in sidebar (desktop)
- [ ] Error appears in drawer (mobile)
- [ ] Error appears at top (mobile view)

---

## 🎯 Quick Error Type Reference

| Error | Color | Retry Button | How to Test |
|-------|-------|--------------|-------------|
| **Network Error** | 🟡 Yellow | ✅ Yes | DevTools → Offline |
| **Timeout** | 🟡 Yellow | ✅ Yes | DevTools → Slow 3G |
| **Rate Limit (429)** | 🟡 Yellow | ✅ Yes | Make many requests |
| **Server Error (500)** | 🟡 Yellow | ✅ Yes | Mock response |
| **Not Found (404)** | 🔴 Red | ❌ No | Block URL |
| **Invalid Data** | 🔴 Red | ❌ No | Mock bad data |

---

## 🖥️ Screenshots Expected

### Retryable Error (Yellow)
```
┌─────────────────────────────────────────────┐
│ ⚠️ Temporary Error                      ✕   │
│                                              │
│ Network error. Please check your            │
│ internet connection.                         │
│                                              │
│ Error Code: NETWORK_ERROR                    │
│                                              │
│ [ 🔄 Try Again ]                             │
└─────────────────────────────────────────────┘
```

### Non-Retryable Error (Red)
```
┌─────────────────────────────────────────────┐
│ ❌ Error                                 ✕   │
│                                              │
│ USGS data feed not found.                    │
│                                              │
│ Error Code: NOT_FOUND                        │
└─────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

**Q: I don't see the error simulator button**
- A: Make sure you're running `npm start` (development mode)
- A: Check bottom-left corner, it's a small purple button

**Q: Error banner doesn't appear**
- A: Check browser console (F12) for JavaScript errors
- A: Make sure you clicked "Refresh" button after going offline

**Q: "Try Again" doesn't work**
- A: Make sure you went back online in DevTools
- A: Check network tab to see if request is being made

**Q: Can't dismiss error**
- A: Look for the X button in top-right of error banner
- A: Try clicking it multiple times

---

## 📊 Testing Different Scenarios

### Desktop Testing:
1. Make window wide (>1024px)
2. Error should appear in right sidebar
3. Error should also appear at top of main area

### Mobile Testing:
1. Open DevTools (F12)
2. Click device toolbar icon (toggle device mode)
3. Select "iPhone 12 Pro" or similar
4. Trigger error
5. Error should appear:
   - At top of screen
   - Inside the filters drawer when you open it

### Tablet Testing:
1. Use DevTools device mode
2. Select "iPad" or similar
3. Error should appear in mobile drawer

---

## ✨ Advanced Testing

### Test Retry with Delay:
1. Go offline in DevTools
2. Click Refresh → Error appears
3. Wait 5 seconds
4. Go back online
5. Click "Try Again"
6. Watch error disappear and data load

### Test Multiple Errors:
1. Trigger error
2. Dismiss it (click X)
3. Trigger different error
4. Verify correct color/message

### Test Error Persistence:
1. Trigger error
2. Open mobile drawer
3. Error should show in drawer
4. Close drawer
5. Error should still show at top

---

## 📝 Notes

- **Production builds** don't show the Error Simulator button
- **Console logs** show detailed error information for debugging
- **All errors** are caught and displayed user-friendly
- **Automatic retries** happen 2 times with exponential backoff

For complete documentation, see: `docs/ERROR_HANDLING.md`
