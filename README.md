# TAOI Employee Homepage

Simple internal browser start page for Takaful Oman employees with:

- Takaful Oman logo branding
- Google search bar
- Important links section
- Latest announcements section
- Role-based permissions
  - **Super Admin**: publish announcements, add links, remove links
  - **Publisher**: publish announcements
  - **Employee**: view/search only

## Run locally

This project is static HTML/CSS/JavaScript. You can open `index.html` directly, or serve it with any static server.

Example:

```bash
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

## Demo credentials

- `superadmin / TAOI@2026`
- `publisher / TAOI@2026`
- `employee / TAOI@2026`

## Notes

- Links and announcements are stored in browser `localStorage` (per browser/device).
- For production with real employee accounts and secure permissions, connect this UI to your company SSO and backend APIs.
