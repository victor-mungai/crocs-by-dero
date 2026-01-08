# Admin Portal Access Guide

## 🔐 Admin Login Credentials

### Fallback Password (Always Works)
**Password:** `dero2024`

This password works regardless of Firebase configuration. Use this if Firebase login is not working.

### Firebase Login (If Configured)
- **Email:** Your Firebase admin email
- **Password:** Your Firebase admin password

## 🔗 Admin Access Links

### Primary Admin Link (Hidden from Search Engines)
```
https://your-site.netlify.app/manage-dashboard
```

This is the **recommended** admin access link. It's:
- ✅ Hidden from search engines (robots.txt)
- ✅ Not shown in navigation
- ✅ Harder to discover

### Backup Admin Link
```
https://your-site.netlify.app/admin
```

This link is also available but blocked by robots.txt from search engine indexing.

## 🚀 Quick Access

1. **Use the hidden link:** `/manage-dashboard`
2. **Enter password:** `dero2024`
3. **Access granted!**

## 📝 Notes

- The fallback password (`dero2024`) works even when Firebase is configured
- If Firebase login fails, you can always use the fallback password
- Both `/admin` and `/manage-dashboard` routes work, but `/manage-dashboard` is more secure
- Search engines are blocked from indexing both admin routes

## 🔒 Security Tips

1. **Don't share the admin link publicly**
2. **Change the fallback password** if needed (edit `src/pages/Admin.jsx`)
3. **Use Firebase authentication** for better security across devices
4. **Keep your credentials safe**

---

**Admin Access:** `/manage-dashboard`  
**Password:** `dero2024`

