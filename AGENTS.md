# AGENTS.md — ข้อกำหนดการทำงานของโปรเจค

## กฎการ Push ขึ้น Git (สำคัญ)

ทุกครั้งที่ทำงาน/แก้ไขงานให้ผู้ใช้ **เสร็จเรียบร้อย** ให้ทำตามขั้นตอนนี้เสมอ:

1. ตรวจสอบการเปลี่ยนแปลงด้วย `git status`
2. `git add` ไฟล์ที่เกี่ยวข้อง (อย่า `git add .` แบบไม่ตรวจสอบ)
3. `git commit` พร้อมข้อความอธิบายที่ชัดเจน **ต้องเขียนข้อความเป็นภาษาไทยเสมอ** (สามารถขึ้นต้นด้วย Conventional Commits เช่น `fix:`, `feat:`, `style:`, `refactor:` ได้ แต่เนื้อหาหลักให้เป็นภาษาไทย)
4. `git push` ขึ้น remote ปลายทาง: `https://github.com/Comebackism/Project_waffle_tee_ob`

### Remote ที่ต้อง Push
- `origin` → `https://github.com/Comebackism/Project_waffle_tee_ob.git`
- สาขาหลัก: `main`

### หมายเหตุ
- หากยังไม่มี remote `origin` ให้เพิ่มก่อน:
  `git remote add origin https://github.com/Comebackism/Project_waffle_tee_ob.git`
- ถ้าการ push ต้องใช้ credential ให้แจ้งผู้ใช้
- อย่า commit ไฟล์ที่ไม่เกี่ยวข้องหรือไฟล์ที่ผู้ใช้กำลังแก้ไขค้างอยู่โดยไม่ยืนยัน
