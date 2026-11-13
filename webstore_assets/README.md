# Chrome Web Store assets

รูปโปรโมชันและสกรีนช็อตสำหรับ Chrome Web Store ถูกสร้างจาก HTML mock ใน `_gen/` แล้วแคปด้วย Playwright → เขียนออกมาที่โฟลเดอร์นี้

## โครงสร้าง

```
webstore_assets/
├── README.md                 ← ไฟล์นี้
├── cover.jpeg / cover_440x280.jpeg
├── cover2.jpeg / cover2_440x280.jpeg
├── cover_landing.png / cover_landing_440x280.png
├── ss_light.png / ss_dark.png
├── popup_light.png / popup_dark.png
└── _gen/                     ← แหล่ง gen (แก้ที่นี่แล้วรัน capture)
    ├── capture.mjs           ← สคริปต์แคปรูปทั้งหมด
    ├── promo.css / promo.js  ← สไตล์ + scale stage 1280×800 ร่วมกัน
    ├── chrome-stub.js        ← stub chrome.* สำหรับ mock popup
    ├── cover_classic.html    → cover.jpeg + cover_440x280.jpeg
    ├── cover.html            → cover2.jpeg + cover2_440x280.jpeg
    ├── cover_landing.html    → cover_landing.png + cover_landing_440x280.png
    ├── scene.html            → ss_light.png / ss_dark.png
    ├── popup.html            → popup_light.png / popup_dark.png
    └── reference/            ← รูปต้นฉบับเก่าไว้เทียบ style
```

## ขนาดเป้าหมาย

Cover ทั้งสามแบบมี **2 ขนาด** จาก HTML เดียวกัน:

| ไฟล์ | ขนาด | หมายเหตุ |
|------|------|----------|
| `cover.jpeg`, `cover2.jpeg`, `cover_landing.png` | **1280 × 800** | marquee / large promo |
| `cover_440x280.jpeg`, `cover2_440x280.jpeg`, `cover_landing_440x280.png` | **440 × 280** | small promo tile |
| `ss_light.png`, `ss_dark.png` | **1280 × 800** | store screenshots |
| `popup_*.png` | กว้าง 720px (2× ของ 360) | แคปตามความสูงจริงของ popup |

Cover ออกแบบบน stage **1280 × 800** ใน HTML (`promo.js` หรือสคริปต์ในหน้า จะ scale ให้พอดี viewport)  
tile 440×280 ใช้ viewport ชั่วคราว 1320×840 แล้ว `sips` ย่อลง (อัตราส่วนสูงกว่า 16:10 เล็กน้อย พื้นหลังเติมส่วนที่เหลือ)

## วิธี gen ใหม่

จาก root ของ repo:

```bash
# 1) เสิร์ฟโฟลเดอร์โปรเจกต์ (ต้องรันค้างไว้)
python3 -m http.server 8765 --bind 127.0.0.1

# 2) ในเทอร์มินัลอีกอัน
cd webstore_assets/_gen
npm install --no-save playwright-core
node capture.mjs              # gen ทั้งหมด
node capture.mjs cover        # ทุกไฟล์ชื่อมี cover
node capture.mjs 440x280      # เฉพาะ tile เล็ก
node capture.mjs cover2       # เฉพาะ cover2*
```

- ต้องการ Chromium-based browser (ค่าเริ่มต้นชี้ไปที่ Brave บน macOS)
- เปลี่ยน path ได้ด้วย `BROWSER_PATH=...`
- เปลี่ยน base URL ได้ด้วย `MOCK_BASE=...` (ค่าเริ่มต้น `http://127.0.0.1:8765/webstore_assets/_gen`)
- บน macOS จะ supersample แล้วย่อด้วย `sips`; ถ้าไม่มี `sips` จะแคปตรงขนาดปลายทางแทน

## แก้รูปแล้ว gen อย่างไร

1. แก้ HTML ที่เกี่ยวข้องใน `_gen/` (อย่าแก้ไฟล์ PNG/JPEG โดยตรงถ้ายังใช้ pipeline นี้)
2. Cover ใช้ stage 1280×800 ที่ scale ตาม viewport — อย่าล็อก `html`/`body` เป็นพิกเซลตายตัว
3. Popup ใน landing / cover2 / scene โหลดจาก mock ที่ชี้ไป UI จริง (`../../popup.html`) เพื่อให้ตาม shipped UI
4. รัน `node capture.mjs <filter>` ตามด้านบน แล้วเช็กขนาดด้วย เช่น  
   `sips -g pixelWidth -g pixelHeight ../cover_440x280.jpeg`

## แมป HTML → ไฟล์ผลลัพธ์

นิยามอยู่ใน `jobs` ของ `_gen/capture.mjs`:

| HTML | สี | ผลลัพธ์ |
|------|-----|---------|
| `cover_classic.html` | dark | `cover.jpeg` + `cover_440x280.jpeg` |
| `cover.html` | dark | `cover2.jpeg` + `cover2_440x280.jpeg` |
| `cover_landing.html` | dark | `cover_landing.png` + `cover_landing_440x280.png` |
| `scene.html` | light / dark | `ss_light.png` / `ss_dark.png` |
| `popup.html?data=cws` | light / dark | `popup_light.png` / `popup_dark.png` |

## โน้ตสั้น ๆ

- ชื่อแอปใน cover ปัจจุบัน: **Tab Split & Merger**
- `reference/` เก็บต้นฉบับเก่า (`cover_classic_1376x768.jpeg`, `cover_landing_800x500.png`) สำหรับเทียบ style เท่านั้น ไม่ได้อัปขึ้น store
- `_gen/node_modules`, `package*.json`, `.hires.png` ถูก gitignore — ติดตั้ง Playwright เฉพาะตอน gen
