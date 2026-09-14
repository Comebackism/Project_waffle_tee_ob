# ตี๋อบ วาฟเฟิล - ระบบจัดการจุดขายและหน้าร้าน (Tee Ob Waffle POS System)

ระบบบริหารจัดการร้านอาหารและจุดขาย (Point of Sale - POS) แบบครบวงจร สำหรับร้านขนมและเครื่องดื่ม "ตี๋อบ วาฟเฟิล" รองรับการสั่งอาหารผ่าน QR Code หน้าร้าน, ระบบแคชเชียร์, หน้าจอห้องครัว (Kitchen Display System - KDS), ระบบคลังสินค้า และแดชบอร์ดสรุปยอดขายสำหรับผู้บริหาร

---

## ฟีเจอร์หลักของระบบ (Key Features)

### 1. ระบบลูกค้าสั่งอาหารผ่าน QR Code (Customer Order)
- **สแกนสั่งอาหาร**: สแกน QR Code ประจำโต๊ะเพื่อสั่งอาหารทานที่ร้าน หรือสั่งกลับบ้าน
- **เลือกปรับแต่งเมนู**: เลือกท็อปปิ้ง, ระดับความหวาน, และขนาดสินค้าได้ตามต้องการ
- **ระบบตะกร้าสินค้า**: ตรวจสอบรายการ, แก้ไขเมนู, ระบุคำขอพิเศษ และเลือกขอช้อนส้อม
- **ชำระเงินผ่าน PromptPay**: สร้าง QR Code สำหรับสแกนจ่ายเงิน พร้อมปุ่มดาวน์โหลด/บันทึกรูป QR ลงในเครื่อง
- **ติดตามสถานะคำสั่งซื้อ**: เช็คคิวและสถานะออเดอร์แบบเรียลไทม์ (รอชำระเงิน -> รอดำเนินการ -> กำลังปรุง -> พร้อมเสิร์ฟ -> เสร็จสิ้น)

### 2. ระบบแคชเชียร์ (Cashier)
- **จัดการออเดอร์**: ดูรายการสั่งซื้อ ตรวจสอบหลักฐานการชำระเงิน และอัปเดตสถานะ
- **ยกเลิกออเดอร์**: แคชเชียร์และแอดมินสามารถยกเลิกออเดอร์ได้ (เฉพาะสถานะรอชำระเงินและรอดำเนินการ พร้อมหน้าต่างยืนยันก่อนยกเลิก)
- **จัดการโต๊ะ & พิมพ์ QR Code**: เปิดโต๊ะ สร้างเซสชัน QR Code และพิมพ์ QR Code ประจำโต๊ะ
- **สลับผู้ใช้งาน (Switch User)**: รองรับการสลับกะ/ผู้ใช้งานด้วยรหัส PIN และระบุหมายเลขเครื่อง POS

### 3. ระบบหน้าจอห้องครัว (Kitchen Display System - KDS)
- **คิวปรุงอาหารเรียลไทม์**: แสดงรายการออเดอร์ที่ต้องทำ แยกชัดเจนระหว่างทานที่ร้าน (ระบุเลขโต๊ะ) หรือกลับบ้าน
- **รายละเอียดเมนู**: แสดงท็อปปิ้ง ระดับความหวาน และหมายเหตุคำขอพิเศษของลูกค้า
- **อัปเดตสถานะ**: กดรับทำอาหาร (กำลังปรุง) และแจ้งเตือนเมื่อปรุงเสร็จพร้อมเสิร์ฟ

### 4. ระบบผู้ดูแลระบบ (Admin)
- **แดชบอร์ดสรุปยอดขาย (Smart Dashboard)**:
  - การ์ดยอดขายและจำนวนออเดอร์ทำงานเชื่อมโยงกัน (Sync) เลือกดูได้ทั้ง วันนี้, เมื่อวาน, เดือนนี้, ปีนี้ หรือกำหนดวัน/เดือน/ปี เอง
  - กราฟแสดงแนวโน้มยอดขาย (รายชั่วโมง, รายสัปดาห์, รายเดือน)
  - รายงานเมนูยอดนิยมและขายดีที่สุดประจำเดือน
  - การแจ้งเตือนสต็อกวัตถุดิบที่ใกล้หมด
- **จัดการพนักงาน (User & Role Management)**: เพิ่ม ลบ แก้ไขข้อมูลพนักงาน และกำหนดบทบาทผู้ใช้งาน
- **จัดการคลังสินค้า (Inventory Management)**: ตรวจสอบและบันทึกสต็อกวัตถุดิบ คำนวณปริมาณคงเหลือและหน่วยนับ
- **จัดการเมนูหน้าร้าน (Menu Management)**: เพิ่ม ลบ แก้ไขเมนู, อัปโหลดรูปภาพ, เปิด/ปิดสถานะสินค้าหมด พร้อมปุ่มดูมุมมองจำลองหน้าจอลูกค้า (Customer View Preview)

---

## บทบาทและสิทธิ์ผู้ใช้งาน (Roles & Permissions)

| รหัสบทบาท | ชื่อบทบาท | สิทธิ์การเข้าถึง |
|---|---|---|
| **R01** | ผู้ดูแลระบบ (Admin) | เข้าถึงได้ทุกระบบ (แดชบอร์ด, จัดการพนักงาน, ออเดอร์, ครัว, โต๊ะ, คลัง, จัดการเมนู) |
| **R02** | แคชเชียร์ (Cashier) | จัดการออเดอร์, จัดการโต๊ะ (QR), คลังสินค้า, จัดการเมนูหน้าร้าน |
| **R03** | แผนกครัว (Kitchen) | หน้าจอคิวทำอาหาร (KDS), จัดการสถานะเมนูหน้าร้าน |

---

## ลำดับสถานะออเดอร์ (Order Status Workflow)

```text
[S01: รอชำระเงิน] 
       |
       v
[S02: รอดำเนินการ] ──> (สามารถยกเลิกได้ -> S06: ยกเลิกแล้ว)
       |
       v
[S03: กำลังปรุง]   ──> (ไม่สามารถยกเลิกได้แล้ว)
       |
       v
[S04: ปรุงเสร็จ / พร้อมเสิร์ฟ]
       |
       v
[S05: เสร็จสิ้น]
```

---

## เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Date & Calendar**: [Flatpickr](https://flatpickr.js.org/) + `react-flatpickr`
- **QR Code Generation**: `qrcode.react` + HTML5 Canvas API
- **Icons**: [React Icons (FontAwesome)](https://react-icons.github.io/react-icons/)
- **Styling**: Vanilla CSS (Custom Design System, Glassmorphism, Micro-animations)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (`pg` pool connection)
- **Authentication**: JWT ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Media Uploads**: Local Storage / [Cloudinary](https://cloudinary.com/)

---

## โครงสร้างโฟลเดอร์ (Project Structure)

```text
project-pos/
├── backend/                  # เซิร์ฟเวอร์ API Backend (Node.js & Express)
│   ├── config/               # การเชื่อมต่อ Database (PostgreSQL)
│   ├── controllers/          # คอนโทรลเลอร์ประมวลผล Business Logic
│   ├── routes/               # กำหนด Endpoint APIs
│   ├── public/images/        # พื้นที่จัดเก็บไฟล์รูปภาพ
│   └── server.js             # จุดเริ่มต้นการทำงานของ Backend
│
├── frontend/                 # เว็บแอปพลิเคชัน Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # คอมโพเนนต์ส่วนกลาง (Navbar, Modal, ErrorBoundary)
│   │   ├── layouts/          # โครงสร้างหน้าเว็บ (CustomerLayout, BackofficeLayout)
│   │   ├── pages/            # หน้าจอแต่ละส่วน
│   │   │   ├── Customer/     # สั่งอาหาร, ตะกร้า, จ่ายเงิน, เช็คสถานะ
│   │   │   ├── Cashier/      # จัดการออเดอร์, จัดการโต๊ะ, แดชบอร์ด
│   │   │   ├── Kitchen/      # หน้าจอ KDS ทำอาหาร
│   │   │   ├── Admin/        # จัดการพนักงาน
│   │   │   ├── Shared/       # จัดการสต็อก, จัดการเมนูหน้าร้าน
│   │   │   └── Login/        # หน้าเข้าสู่ระบบ
│   │   └── utils/            # ฟังก์ชันตัวช่วย (apiFetch, helpers)
│   └── package.json
│
└── README.md                 # คู่มือและเอกสารประกอบโปรเจกต์
```

---

## ขั้นตอนการติดตั้งและเริ่มต้นใช้งาน (Getting Started)

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
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=pos_db
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
```

รันเซิร์ฟเวอร์ Backend:
```bash
# สำหรับโหมดพัฒนา (Development with Nodemon)
npm run dev

# สำหรับโหมดรันปกติ (Production)
npm start
```
*Backend จะทำงานที่ `http://localhost:5000`*

### 3. ติดตั้งและตั้งค่า Frontend
เปิด Terminal ใหม่แล้วเข้าไปที่โฟลเดอร์ `frontend`:
```bash
cd frontend
npm install
```

รัน Frontend สำหรับพัฒนา:
```bash
npm run dev
```
*Frontend จะทำงานที่ `http://localhost:5173` (หรือพอร์ตที่ Vite กำหนด)*

สำหรับการ Build เพื่อใช้งานจริง:
```bash
npm run build
```

---

## ใบอนุญาต (License)
โปรเจกต์นี้พัฒนาขึ้นเพื่อการใช้งานภายในร้าน **ตี๋อบ วาฟเฟิล** สงวนลิขสิทธิ์ตามกฎหมาย
