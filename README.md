# ตี๋อบ วาฟเฟิล HongKong — ระบบจัดการจุดขายและหน้าร้าน (Tee Ob Waffle POS System)

ระบบบริหารจัดการร้านอาหารและจุดขาย (Point of Sale - POS) แบบครบวงจร สำหรับร้านขนมและเครื่องดื่ม "ตี๋อบ วาฟเฟิล HongKong" รองรับการสั่งอาหารผ่าน QR Code ประจำโต๊ะ, ระบบแคชเชียร์, หน้าจอห้องครัว (Kitchen Display System - KDS), ระบบคลังสินค้า, จัดการเมนูหน้าร้าน และแดชบอร์ดสรุปยอดขายสำหรับผู้บริหาร

---

## ฟีเจอร์หลักของระบบ (Key Features)

### 1. ระบบลูกค้าสั่งอาหารผ่าน QR Code (Customer Order)
- **สแกนสั่งอาหาร**: สแกน QR Code ประจำโต๊ะ (ทานที่ร้าน) หรือ QR หน้าร้าน (กลับบ้าน) ระบบตรวจสอบเซสชันก่อนใช้งาน และแจ้งเตือนเมื่อ QR หมดอายุ/ถูกปิด
- **เมนูและสินค้าขายดี**: หน้าแรกแสดงเมนูทั้งหมดพร้อมช่องค้นหา และแถบ "สินค้าขายดีประจำเดือน" (สูงสุด 8 อันดับ)
- **เลือกปรับแต่งเมนู**: เลือกท็อปปิ้ง (ระบุจำนวนได้) พร้อมดูราคาและแคลอรีต่อรายการ
- **ระบบตะกร้าสินค้า**: รวมรายการที่เมนูและชุดท็อปปิ้งเหมือนกันเป็นรายการเดียวอัตโนมัติ, แก้ไข/ลบรายการ, ระบุคำขอพิเศษ และเลือกขอช้อนส้อม
- **รูปแบบการรับประทาน**: เลือก "ทานที่ร้าน" หรือ "กลับบ้าน" (ออเดอร์กลับบ้านจะแจ้งเตือนให้สั่งในบิลเดียว เพราะ QR จะถูกปิดหลังเสร็จสิ้น)
- **ชำระเงิน 2 ช่องทาง**:
  - **เงินสด**: สร้างออเดอร์แล้วพาไปหน้ารอชำระเงินที่เคาน์เตอร์ (ระบบเช็คสถานะอัตโนมัติทุก 3 วินาที)
  - **โอนเงิน / พร้อมเพย์**: สร้าง PromptPay QR (มาตรฐาน EMVCo) ให้สแกนจ่าย บันทึก/แชร์รูป QR ได้ พร้อมอัปโหลดสลิปเพื่อยืนยัน (ตรวจสอบสลิปอัตโนมัติผ่าน SlipOK ทั้งยอดเงิน ผู้รับ และกันสลิปซ้ำ)
- **ติดตามสถานะคำสั่งซื้อ**: ดูคิวและสถานะแบบเรียลไทม์ (รอชำระเงิน → รอดำเนินการ → กำลังปรุง → พร้อมรับ → เสร็จสิ้น), แสดงตำแหน่งคิวก่อนหน้า, ดูใบเสร็จ/สลิป และยกเลิกออเดอร์ได้เองในสถานะรอชำระเงิน
- **ประวัติการสั่งของโต๊ะ (My Orders)**: ดูออเดอร์ทั้งหมดของเซสชันโต๊ะนั้นในวันเดียวกัน

### 2. ระบบแคชเชียร์ (Cashier)
- **จัดการออเดอร์ตามสถานะ**: แสดงออเดอร์วันนี้แยกแท็บตามสถานะ พร้อมตัวนับจำนวน และรีเฟรชอัตโนมัติทุก 5 วินาที
- **ยืนยันการชำระเงิน**: ตรวจสอบสลิป/หลักฐานการชำระเงิน แล้วกด "ยืนยันชำระเงิน" (S01 → S02)
- **ส่งออเดอร์เข้าครัว**: กด "ส่งไปครัว" (S02 → S03)
- **ปิดงานเมื่อลูกค้ารับอาหาร**: กด "ลูกค้ารับแล้ว" (S04 → S05)
- **ยกเลิกออเดอร์**: ยกเลิกได้เฉพาะสถานะรอชำระเงินและรอดำเนินการ (S01/S02 → S06) พร้อมหน้าต่างยืนยัน
- **พิมพ์ใบเสร็จ / สลิป**: ดูและพิมพ์สลิปแบบความร้อน (Thermal) พร้อมรายละเอียดเมนู ท็อปปิ้ง ยอดสุทธิ และช่องทางชำระเงิน
- **จัดการโต๊ะ & พิมพ์ QR Code**: เปิดเซสชัน QR ประจำโต๊ะ (ทานที่ร้าน: ไม่ตั้งเวลาหมดอายุ ปิดโต๊ะเอง / หน้าร้าน: กำหนดระยะเวลาเองได้ รองรับหลายเซสชันพร้อมกัน) และพิมพ์ป้าย QR Code
- **สลับผู้ใช้งาน (Switch User)**: สลับกะ/ผู้ใช้งานด้วยรหัสผ่าน โดยแอดมินสลับได้ทุกคน บทบาทอื่นเห็นเฉพาะบทบาทเดียวกัน พร้อมแสดงหมายเลขเครื่อง POS

### 3. ระบบหน้าจอห้องครัว (Kitchen Display System - KDS)
- **คิวปรุงอาหารเรียลไทม์**: แสดงออเดอร์ที่ต้องทำ (S02/S03/S04) แยกชัดเจนระหว่างทานที่ร้าน (ระบุเลขโต๊ะ) หรือกลับบ้าน และรีเฟรชอัตโนมัติทุก 5 วินาที
- **รายละเอียดเมนู**: แสดงท็อปปิ้ง จำนวน และหมายเหตุคำขอพิเศษของลูกค้า
- **ทยอยทำทีละชิ้น**: ติ๊ก/ปรับจำนวนชิ้นที่ทำเสร็จ แล้วชิ้นนั้นย้ายไปคอลัมน์ "พร้อมเสิร์ฟ" แบบทีละอัน
- **อัปเดตสถานะ**: กดยืนยันเพื่อเลื่อนออเดอร์ไปเป็น "พร้อมรับ" (S04) เมื่อทำครบ

### 4. ระบบผู้ดูแลระบบ (Admin)
- **จัดการพนักงาน (User & Role Management)**: เพิ่ม แก้ไข ลบข้อมูลพนักงาน กำหนดบทบาท พร้อมตรวจสอบความถูกต้องของข้อมูล (เบอร์โทร, ชื่อ-นามสกุล, การยืนยันรหัสผ่าน) และเข้ารหัสรหัสผ่านด้วย bcrypt
- **แดชบอร์ดสรุปยอดขาย (Smart Dashboard)** *(เฉพาะผู้ดูแลระบบ)*:
  - การ์ดยอดขายและจำนวนออเดอร์ เลือกดูได้ทั้ง วันนี้, เมื่อวาน, เดือนนี้, ปีนี้ หรือกำหนดช่วงวันที่เอง
  - กราฟแนวโน้มยอดขาย/จำนวนออเดอร์ (รายชั่วโมง, รายวัน, 30 วัน, รายเดือน)
  - รายงานเมนูขายดี และการแจ้งเตือนสต็อกวัตถุดิบที่ใกล้หมด/หมดแล้ว
  - สถิติจำนวนพนักงานแยกตามบทบาท

### 5. ระบบส่วนกลาง (Shared: Inventory & Menu)
- **จัดการคลังสินค้า (Inventory Management)**: เพิ่ม/แก้ไข/ลบวัตถุดิบ แยกหมวดหมู่ (วัตถุดิบหลัก, ท็อปปิ้ง, บรรจุภัณฑ์), เติมสต็อก (บวกเพิ่ม/ตั้งค่าใหม่), **เบิกวัตถุดิบ** พร้อมดูประวัติการเบิก (Invoice) และการแจ้งเตือนสต็อกต่ำ
- **จัดการเมนูหน้าร้าน (Menu Management)**: จัดการเมนูและท็อปปิ้ง (เพิ่ม/แก้ไข/ลบ/เปิด-ปิดการขาย), อัปโหลดรูปภาพ, กำหนดราคาและแคลอรี พร้อมปุ่มดูมุมมองจำลองหน้าจอลูกค้า (Customer View Preview)

---

## บทบาทและสิทธิ์ผู้ใช้งาน (Roles & Permissions)

| รหัสบทบาท | ชื่อบทบาท | หน้าจอที่เข้าถึงได้ | สิทธิ์การใช้งานหลัก |
|---|---|---|---|
| **R01** | ผู้ดูแลระบบ (Admin) | จัดการพนักงาน, แดชบอร์ด, ออเดอร์, ห้องครัว, จัดการโต๊ะ (QR), คลังสินค้า, จัดการเมนูหน้าร้าน | เข้าถึงได้ทุกระบบ |
| **R02** | แคชเชียร์ (Cashier) | ออเดอร์, จัดการโต๊ะ (QR), คลังสินค้า, จัดการเมนูหน้าร้าน | รับชำระเงิน จัดการสถานะออเดอร์ จัดการโต๊ะ/QR จัดการคลังและเมนู |
| **R03** | แผนกครัว (Kitchen) | ห้องครัว (KDS), จัดการเมนูหน้าร้าน | ดูคิวและอัปเดตสถานะการปรุง, จัดการเมนูหน้าร้าน |

> หมายเหตุ: การเข้าถึงหน้าจอถูกควบคุมด้วย `ProtectedRoute` ฝั่ง Frontend และตรวจสอบ JWT (`authMiddleware`) ฝั่ง Backend

---

## ลำดับสถานะออเดอร์ (Order Status Workflow)

| รหัส | สถานะ | ผู้รับผิดชอบ |
|---|---|---|
| **S01** | รอชำระเงิน | ลูกค้า / แคชเชียร์ยืนยัน |
| **S02** | รอดำเนินการ | แคชเชียร์ส่งเข้าครัว |
| **S03** | กำลังปรุง | ครัว |
| **S04** | พร้อมรับ | ครัวแจ้งพร้อมเสิร์ฟ |
| **S05** | เสร็จสิ้น | แคชเชียร์ยืนยันลูกค้ารับแล้ว |
| **S06** | ยกเลิก | ลูกค้า (S01) หรือแคชเชียร์ (S01/S02) |

```text
[ลูกค้าสแกน QR ประจำโต๊ะ / หน้าร้าน]
        |
        v
เลือกเมนู -> ปรับท็อปปิ้ง -> ตะกร้า -> สรุปรายการ/เลือกรูปแบบ -> เลือกวิธีชำระเงิน
        |
   +----+----------------------------+
   | (เงินสด)                        | (โอนเงิน / พร้อมเพย์)
   v                                 v
สร้างออเดอร์ (S01)              สแกน QR พร้อมเพย์ + อัปโหลดสลิป
รอชำระเงินที่เคาน์เตอร์          (ตรวจสลิปผ่าน SlipOK) -> สร้างออเดอร์ (S01)
   +----------------+---------------+
                    v
        แคชเชียร์ "ยืนยันชำระเงิน"  -> S02 รอดำเนินการ
                    v
        แคชเชียร์ "ส่งไปครัว"        -> S03 กำลังปรุง
                    v
        ครัวติ๊กทำทีละชิ้น -> "พร้อมเสิร์ฟ" -> S04 พร้อมรับ
                    v
        แคชเชียร์ "ลูกค้ารับแล้ว"     -> S05 เสร็จสิ้น
                    |
        (ยกเลิกได้ที่ S01/S02) -> S06 ยกเลิก
```

---

## เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Date & Calendar**: [Flatpickr](https://flatpickr.js.org/) + `react-flatpickr` (locale ไทย)
- **QR Code**: `qrcode.react` (แสดง QR พร้อมเพย์/โต๊ะ) + HTML5 Canvas API (บันทึกรูป QR)
- **Icons**: [React Icons (FontAwesome)](https://react-icons.github.io/react-icons/)
- **Styling**: Vanilla CSS (Custom Design System, Glassmorphism, Micro-animations)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (`pg` pool connection)
- **Authentication**: JWT ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Media Uploads**: [Cloudinary](https://cloudinary.com/) (รูปเมนู/ท็อปปิ้ง/สลิป)
- **ตรวจสอบสลิปโอนเงิน**: [SlipOK](https://www.slipok.com/) ผ่าน [axios](https://axios-http.com/) + `form-data`

### การ Deploy
- Frontend พร้อม Deploy บน [Vercel](https://vercel.com/) (`frontend/vercel.json` จัดการ SPA rewrite)
- Backend และ Database (PostgreSQL) ใช้งานร่วมกับบริการ Cloud ได้ (รองรับ `DATABASE_URL` + SSL)

---

## โครงสร้างโฟลเดอร์ (Project Structure)

```text
project-pos/
├── backend/                      # เซิร์ฟเวอร์ API (Node.js & Express)
│   ├── config/db.js              # การเชื่อมต่อ PostgreSQL (บังคับ timestamp เป็น UTC)
│   ├── controllers/              # Business Logic (menu, topping, order, inventory, dashboard, qr, user)
│   ├── middleware/authMiddleware.js  # ตรวจสอบ JWT Token
│   ├── routes/                   # กำหนด Endpoint APIs
│   ├── SQL/                      # ไฟล์สำรอง/สคริปต์ฐานข้อมูล (ไม่ขึ้น Git)
│   ├── public/images/            # พื้นที่จัดเก็บไฟล์รูปภาพ (ไม่ขึ้น Git)
│   └── server.js                 # จุดเริ่มต้นการทำงานของ Backend
│
├── frontend/                     # เว็บแอปพลิเคชัน (React + Vite)
│   ├── src/
│   │   ├── components/           # ส่วนกลาง (Navbar, BottomNavbar, FoodCard, ReceiptSlip, ProtectedRoute, ErrorBoundary)
│   │   ├── layouts/              # โครงสร้างหน้าเว็บ (CustomerLayout, BackofficeLayout)
│   │   ├── pages/
│   │   │   ├── Customer/         # Home, ProductDetail, Cart, Checkout, CashWaiting, OrderStatus, MyOrders
│   │   │   ├── Cashier/          # CashierOrders, TableManager, CashierDashboard (แดชบอร์ด แอดมินเท่านั้น)
│   │   │   ├── Kitchen/          # KitchenKDS (หน้าจอ KDS)
│   │   │   ├── Admin/            # AdminDashboard (จัดการพนักงาน)
│   │   │   ├── Shared/           # InventoryManagement, MenuManagement
│   │   │   └── Login/            # เข้าสู่ระบบ + เลือกเครื่อง POS
│   │   ├── styles/               # ตัวแปรและสไตล์ส่วนกลาง
│   │   ├── utils/api.js          # apiFetch (แนบ JWT), API_BASE, resolveImage
│   │   ├── App.jsx               # กำหนดเส้นทาง (Routes) ทั้งหมด
│   │   └── main.jsx
│   ├── vercel.json               # ค่าตั้งต้นสำหรับ Deploy บน Vercel
│   └── package.json
│
├── AGENTS.md                     # ข้อกำหนดการทำงานของโปรเจกต์ (เช่น กฎการ commit/push)
└── README.md
```

---

## ขั้นตอนการติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### สิ่งที่ต้องเตรียม (Prerequisites)
- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 18 ขึ้นไป)
- [PostgreSQL](https://www.postgresql.org/)
- บัญชี [Cloudinary](https://cloudinary.com/) (สำหรับเก็บรูปภาพ) และ [SlipOK](https://www.slipok.com/) (สำหรับตรวจสลิป — ใช้เฉพาะโหมดพร้อมเพย์)

### 1. โคลนคลังโค้ด (Clone Repository)
```bash
git clone https://github.com/Comebackism/Project_waffle_tee_ob.git
cd Project_waffle_tee_ob
```

### 2. ติดตั้งและตั้งค่า Backend
เข้าไปที่โฟลเดอร์ `backend`:
```bash
cd backend
npm install
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend` และกำหนดค่าตัวแปร:
```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Database (เลือกใช้ DATABASE_URL เมื่ออยู่บน Cloud)
DATABASE_URL=
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=pos_db

# Authentication
JWT_SECRET=your_jwt_secret_key

# Cloudinary (เก็บรูปภาพ)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SlipOK (ตรวจสอบสลิปโอนเงิน)
SLIPOK_API_URL=https://api.slipok.com/api/line/apikey/xxxxx
SLIPOK_API_KEY=your_slipok_key
```

> **ฐานข้อมูล**: ต้องมีฐานข้อมูล PostgreSQL และสร้างตารางให้ครบก่อนรัน (ตารางหลัก: `Menu`, `Topping`, `Order`, `Order_Item`, `Order_Item_Topping`, `Table_Session`, `Product`, `Stock`, `Invoice`, `User`, `Role`, `Status`, `Daily_Summary`, `Daily_Menu_Summary`, `MenuComponent`) หากมีไฟล์สำรองอยู่ใน `backend/SQL/` สามารถ import เข้าฐานข้อมูลได้

รันเซิร์ฟเวอร์ Backend:
```bash
# โหมดพัฒนา (Development with Nodemon)
npm run dev

# โหมดรันปกติ (Production)
npm start
```
*Backend จะทำงานที่ `http://localhost:5000`*

### 3. ติดตั้งและตั้งค่า Frontend
เปิด Terminal ใหม่แล้วเข้าไปที่โฟลเดอร์ `frontend`:
```bash
cd frontend
npm install
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend` (ถ้าไม่ตั้ง จะใช้ค่าเริ่มต้น `http://localhost:5000`):
```env
VITE_API_URL=http://localhost:5000
```

รัน Frontend สำหรับพัฒนา:
```bash
npm run dev
```
*Frontend จะทำงานที่ `http://localhost:5173`*

สำหรับ Build เพื่อใช้งานจริง:
```bash
npm run build
npm run preview
```

### 4. เริ่มต้นใช้งาน
- **พนักงาน**: เข้า `http://localhost:5173/login` เพื่อเข้าสู่ระบบและเลือกเครื่อง POS
- **ลูกค้า**: เข้าเมนู "จัดการโต๊ะ (QR)" เพื่อสร้าง QR ประจำโต๊ะ แล้วให้ลูกค้าสแกน (ลิงก์รูปแบบ `/?session=<session_id>`)

---

## ภาพรวม API Endpoints

| กลุ่ม | Endpoint ตัวอย่าง | การป้องกัน |
|---|---|---|
| Menus | `GET /api/menus`, `GET /api/menus/bestsellers`, `GET/POST/PUT/DELETE /api/menus(/:id)` | สาธารณะ / ต้องล็อกอิน (แก้ไข) |
| Toppings | `GET /api/toppings/admin/all`, `POST/PUT/DELETE /api/toppings(/:id)` | ต้องล็อกอิน |
| Orders | `POST /api/orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/status` | สาธารณะ (ลูกค้า) / ต้องล็อกอิน (จัดการ) |
| QR Sessions | `POST /api/qr/generate`, `GET /api/qr/validate/:session_id`, `PUT /api/qr/end/:session_id` | ต้องล็อกอิน / สาธารณะ (validate) |
| Inventory | `GET /api/inventory`, `POST /api/inventory/add|set|withdraw|product` | ต้องล็อกอิน |
| Dashboard | `GET /api/dashboard/stats`, `GET /api/dashboard/sales-by-date`, `GET /api/dashboard/sales-trend` | ต้องล็อกอิน |
| Users | `POST /api/users/login`, `GET/POST/PUT/DELETE /api/users(/:id)` | สาธารณะ (login) / ต้องล็อกอิน |

---

## หมายเหตุการทำงานของระบบ (Notes)

- **เขตเวลา (Timezone)**: ระบบจัดเก็บเวลาในฐานข้อมูลเป็น UTC และแปลงเป็นเขตเวลาไทย (Asia/Bangkok) ทุกครั้งที่คำนวณยอดขาย/คิว เพื่อป้องกันยอดขายข้ามวันคลาดเคลื่อน
- **Auto-Archive**: ระบบจะสรุปยอดขายและเมนูขายดีรายวันลงตาราง `Daily_Summary` / `Daily_Menu_Summary` และเก็บออเดอร์เก่าเข้า archive อัตโนมัติ เพื่อให้รายงานย้อนหลังยังถูกต้อง
- **การปิด QR อัตโนมัติ**: QR ของออเดอร์ "กลับบ้าน" จะถูกปิดเมื่อออเดอร์เสร็จสิ้น (S05) ส่วน QR "ทานที่ร้าน" จะปิดเมื่อแคชเชียร์ปิดโต๊ะเอง

---

## ใบอนุญาต (License)
โปรเจกต์นี้พัฒนาขึ้นเพื่อการใช้งานภายในร้าน **ตี๋อบ วาฟเฟิล HongKong** สงวนลิขสิทธิ์ตามกฎหมาย
