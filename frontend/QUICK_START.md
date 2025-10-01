# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

The `.env.local` file is already created with default values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

If your backend runs on a different URL, update this file.

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Login

Use the credentials created in the backend seeding:

**Admin User:**
- Email: `admin@asiservis.com`
- Password: `admin123`

**Supervisor User:**
- Email: `supervisor@asiservis.com`
- Password: `supervisor123`

**Operario User:**
- Email: `operario@asiservis.com`
- Password: `operario123`

---

## 📋 First Time Checklist

After logging in, try these actions:

### As OPERARIO
1. ✅ View the dashboard
2. ✅ Create a new form (`/forms/new`)
3. ✅ Add temperature records
4. ✅ Submit form for review

### As SUPERVISOR
1. ✅ Review submitted forms
2. ✅ Approve or reject forms
3. ✅ View reports (`/reports`)
4. ✅ Generate statistics

### As ADMIN
1. ✅ Manage products (`/products`)
2. ✅ Create new products
3. ✅ Edit temperature ranges
4. ✅ Toggle product status

---

## 🎨 Features to Explore

### Dark Mode
Click the moon/sun icon in the top bar to toggle dark mode.

### Digital Signatures
When submitting a form, draw your signature on the canvas.

### Temperature Alerts
Add a temperature outside the product's range to see the alert indicator.

### Reports & Charts
- Navigate to `/reports`
- Select a date range
- Click "Generar Reporte"
- Export to PDF or Excel

### Responsive Design
- Resize your browser window
- Test on mobile devices
- Try the collapsible sidebar

---

## 🔧 Development Tools

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npm test           # Run tests
```

### Browser DevTools

1. **React DevTools**: Install the browser extension
2. **Redux DevTools**: Works with Zustand stores
3. **Network Tab**: Monitor API calls

---

## 📱 Testing on Mobile

### Using ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start the dev server: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the ngrok URL on your mobile device

### Using Local IP

1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access from mobile: `http://YOUR_IP:3000`
3. Make sure backend URL is also accessible

---

## 🐛 Common Issues

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### CORS Errors

Make sure the backend has CORS enabled for `http://localhost:3000`

### Token Expired

The app automatically refreshes tokens. If you see errors:
1. Clear browser localStorage
2. Log out and log in again
3. Check backend token expiration settings

### Styles Not Loading

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📚 Learning Resources

### Next.js 14
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)

### shadcn/ui
- [Component Documentation](https://ui.shadcn.com)
- [Examples](https://ui.shadcn.com/examples)

### Zustand
- [Zustand Documentation](https://docs.pmnd.rs/zustand)

### React Hook Form
- [React Hook Form Docs](https://react-hook-form.com)

---

## 🎯 Next Steps

1. **Customize**: Update colors, logos, and branding
2. **Add Features**: Implement user management, notifications, etc.
3. **Optimize**: Add caching, reduce bundle size
4. **Deploy**: Deploy to Vercel or your hosting provider
5. **Monitor**: Set up error tracking (Sentry, LogRocket)

---

## 💡 Pro Tips

### Fast Refresh
Next.js has Fast Refresh enabled. Changes appear instantly without losing component state.

### TypeScript Autocomplete
Use `Ctrl+Space` (or `Cmd+Space` on Mac) for autocomplete in VS Code.

### Component Discovery
All components have JSDoc comments. Hover over them to see documentation.

### API Client
The API client handles authentication automatically. Just use the functions from `lib/api/endpoints.ts`

### State Management
Use Zustand stores for global state. They're simple and powerful.

---

## 🆘 Get Help

If you encounter issues:

1. Check the console for error messages
2. Review the `README.md` for detailed documentation
3. Check the `IMPLEMENTATION_SUMMARY.md` for architecture details
4. Review the backend API documentation
5. Contact the development team

---

**Happy Coding!** 🎉
