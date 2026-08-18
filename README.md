# myprofile-pro — Enhanced Portfolio Replica

This is an **enhanced replica** of the original `myprofile` project. The original codebase is untouched.

## What's Improved

### Mobile Responsiveness
- **Hamburger menu** with slide-out navigation drawer
- Full-screen CV modal on phones and tablets
- Portrait card reordered above hero text on mobile
- Touch-friendly buttons (minimum 48px tap targets)
- Safe-area insets for notched devices (iPhone, etc.)
- Bottom-sheet style AI chatbot on mobile
- Responsive typography and spacing across all sections

### CV Download & Upload (Mobile Fix)
- **Upload button** uses programmatic file picker (works on iOS/Android)
- Replaced `prompt()` PIN dialog with inline modal (mobile-friendly)
- PDF preview fallback: "View in Browser" + "Download" on mobile (iframes fail on iOS)
- Drag-and-drop upload on desktop
- File size validation (10 MB max)
- "Open in New Tab" option for viewing CV on mobile

### Professional UI Features
- Scroll progress bar at top
- Back-to-top button
- Active section highlighting in navigation
- Share profile button (Web Share API on mobile, clipboard fallback)
- Theme preference saved to localStorage
- Reduced-motion support for accessibility

## Run Locally

```bash
cd myprofile-pro
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
```

## Project Location

```
d:\Studies and Projects\Projects_React\My Profile\myprofile-pro\
```

Original project (unchanged):
```
d:\Studies and Projects\Projects_React\My Profile\myprofile\
```
