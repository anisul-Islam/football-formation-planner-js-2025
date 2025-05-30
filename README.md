# ⚽ [Football Formation Planner](https://football-formation-planner.netlify.app/)

This is a web-based tactical formation planner that allows users to design football formations interactively. Create custom player cards, drag and drop them onto the field, save them to local storage, and even export your formation as an image.

---

## 🚀 Features

### ✅ Core Functionalities
| Part | Feature |
|------|---------|
| 1️⃣  | Setup the football field layout with goals, D-boxes, midline, and center circle |
| 2️⃣  | Display static players on the field |
| 3️⃣  | Make players draggable (mouse and touch support) |
| 4️⃣  | Add new players via form |
| 5️⃣  | Delete players from field or bench |
| 6️⃣  | Save and load player data from `localStorage` |
| 7️⃣  | Export formation as PNG image using [html2canvas](https://html2canvas.hertzen.com/) |
| 8️⃣  | Bench/Substitute area for non-starting players |
| 9️⃣  | Fully responsive and mobile-friendly with drag-and-drop and touch event support |

---

## 💡 Future Improvements

### 🎨 Visual Enhancements
- 🌙 Dark/Light Mode Toggle
- 📏 Zoom In/Out Functionality
- 🗺️ Toggle Mini-map view for better overview

### 🧑‍🎨 Player & Team Customization
- Upload custom player images
- Add jersey numbers
- Choose player background color manually
- Assign player roles (e.g., Captain, Goalkeeper badge)
- Include basic player stats (e.g., speed, rating)

### ✏️ Interactivity Enhancements
- Inline editing: click on player name/country to edit in-place
- Drag players back from field to bench (already implemented)
- Highlight bench on drag hover (already implemented)

---

## 🛠️ Technologies Used

- **HTML5**
- **CSS3 (Responsive design + Media queries)**
- **JavaScript (DOM, Events, localStorage)**
- **[html2canvas](https://html2canvas.hertzen.com/)** (for exporting formations)

---

## 📸 Screenshot

![formation (6)](https://github.com/user-attachments/assets/eaabcaae-a97e-4995-ac24-7a8080c9df37)

---

## 📁 How to Use

1. Clone this repo or download the files.
2. Open `index.html` in your browser.
3. Add players with name, position, and country.
4. Drag players to the field or bench.
5. Click ❌ to delete.
6. Press 📷 "Export Formation as Image" to download the current layout.

---

## 📦 Folder Structure

```bash
football-formation-planner/
│
├── index.html        # Main HTML structure
├── style.css         # Styling and responsive layout
├── index.js          # Core logic and interactivity
├── README.md         # Project documentation
