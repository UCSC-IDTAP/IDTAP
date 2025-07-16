# OAuth Credentials Migration Plan

## Current Status
- OAuth credentials are hardcoded in multiple locations
- Need to migrate to environment variables without downtime

## Files to Update

### 1. server/server.ts
- Lines 36, 43, 1657-1658: Replace hardcoded credentials with env vars + fallback
- Add dual credential support

### 2. python/idtap_api/auth.py  
- Lines 19-20: Replace hardcoded credentials with env vars + fallback
- Create get_default_client_secrets() function

### 3. src/main.ts
- Line 99: Replace hardcoded client ID with env var + fallback

### 4. Environment Variables Needed
```bash
GOOGLE_CLIENT_ID=your_new_client_id
GOOGLE_CLIENT_SECRET=your_new_client_secret
VUE_APP_GOOGLE_CLIENT_ID=your_new_client_id  # For frontend build
```

## Migration Steps
1. ✅ Update code with dual support (fallback to old credentials)
2. ✅ Deploy and test
3. ✅ Create new OAuth credentials in Google Cloud
4. ✅ Set environment variables
5. ✅ Restart app and test with new credentials
6. ✅ Revoke old credentials
7. ✅ Remove hardcoded fallbacks

## Rollback Plan
- If issues occur, simply remove environment variables
- App will fallback to old hardcoded credentials
- No downtime required for rollback