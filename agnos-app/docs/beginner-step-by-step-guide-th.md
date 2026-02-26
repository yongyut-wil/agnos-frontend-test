# คู่มือสร้างโปรเจกต์ Agnos Realtime Patient Intake (ละเอียดสำหรับมือใหม่)

เอกสารนี้อธิบายการสร้างโปรเจกต์นี้ตั้งแต่ศูนย์แบบ Step-by-Step พร้อมคำอธิบายว่าทำไมต้องทำแต่ละขั้น

---

## 0) สิ่งที่คุณจะได้เมื่อทำจบ

หลังทำครบ คุณจะได้เว็บ 3 หน้า:

1. `/` หน้า Landing เลือกเข้า Patient หรือ Staff
2. `/patient` หน้าแบบฟอร์มผู้ป่วย (Realtime + Validation)
3. `/staff` หน้าเจ้าหน้าที่ดูข้อมูลคนไข้แบบสด (Realtime)

และมีระบบ Socket.IO เชื่อมข้อมูลระหว่าง 2 หน้าแบบทันที

---

## 1) เตรียมเครื่องก่อนเริ่ม

### 1.1 ติดตั้งโปรแกรมที่ต้องมี

- **Node.js 20+** (แนะนำ LTS)
- **npm** (มากับ Node)
- **VS Code** หรือ IDE ที่ถนัด
- **Git** (ถ้าต้องการ push ขึ้น GitHub)

ตรวจสอบเวอร์ชัน:

```bash
node -v
npm -v
```

ถ้ารันได้ แปลว่าพร้อม

---

## 2) สร้างโปรเจกต์ Next.js

> ถ้าคุณมีโปรเจกต์นี้อยู่แล้ว ข้ามไปข้อ 3 ได้เลย

```bash
npx create-next-app@latest agnos-app --typescript --eslint --app
```

เข้าโฟลเดอร์โปรเจกต์:

```bash
cd agnos-app
```

---

## 3) ติดตั้ง dependencies ที่โปรเจกต์นี้ใช้

### 3.1 dependencies หลัก

```bash
npm install socket.io socket.io-client zod lucide-react clsx tailwind-merge
```

### 3.2 ติดตั้ง Tailwind v4 (ถ้ายังไม่มี)

```bash
npm install -D tailwindcss @tailwindcss/postcss
```

---

## 4) จัด scripts ใน `package.json`

ไฟล์: `package.json`

ให้ scripts เป็นแบบนี้:

```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js",
    "lint": "eslint"
  }
}
```

เหตุผล:
- เราใช้ `server.js` เพื่อรัน Next.js + Socket.IO ใน process เดียวกัน
- ถ้าใช้ `next dev` ตรงๆ จะไม่ง่ายกับการ attach Socket.IO server แบบที่โปรเจกต์นี้ต้องการ

---

## 5) สร้างไฟล์ `server.js` (หัวใจ realtime backend)

สร้างไฟล์ที่ root โปรเจกต์ชื่อ `server.js`

แนวคิดการทำงาน:
1. สร้าง HTTP server
2. ผูก Next.js handler
3. ผูก Socket.IO เข้ากับ server ตัวเดียวกัน
4. รับ event จาก patient และ broadcast ให้ staff

โค้ดอ้างอิงให้ใช้ตามไฟล์จริง:
- `server.js`

จุดสำคัญที่ต้องมี:
- `patient:update`
- `patient:status`
- `patient:submit`
- ให้ `patient:update` ส่งเข้าห้อง `staff` เท่านั้น เพื่อจำกัดการกระจายข้อมูล
- ให้ staff client เรียก `join:staff` เมื่อเข้า dashboard
- ใส่ `lastUpdated` ตอน broadcast update/submit

---

## 6) สร้างโครงสร้างโฟลเดอร์ใน `src`

สร้างโครงสร้างนี้:

```text
src/
  app/
    page.tsx
    patient/page.tsx
    staff/page.tsx
    layout.tsx
    globals.css
  components/
    Header.tsx
    PatientForm.tsx
    StaffSidebar.tsx
    StaffMetrics.tsx
    ActiveQueue.tsx
    StaffDashboard.tsx
  hooks/
    useSocket.ts
  types/
    patient.ts
  utils/
    validators.ts
```

---

## 7) สร้าง Type กลางของข้อมูลผู้ป่วย

ไฟล์: `src/types/patient.ts`

ให้มี interface `Patient` สำหรับแชร์ shape ของข้อมูลทั้งฝั่ง Patient และ Staff

ควรมี field:
- firstName, middleName, lastName
- dateOfBirth, gender
- phone, email, address
- preferredLanguage, nationality
- emergencyContact (name + relationship)
- religion

---

## 8) สร้าง Validation Schema ด้วย Zod

ไฟล์: `src/utils/validators.ts`

- สร้าง `patientSchema` ด้วย `z.object(...)`
- ฟิลด์บังคับต้อง `min(1)`
- phone ใช้ regex
- email ใช้ `.email()`
- emergencyContact เป็น optional object

โค้ดอ้างอิง:
- `src/utils/validators.ts`

---

## 9) สร้าง Socket Hook

ไฟล์: `src/hooks/useSocket.ts`

แนวทาง:
- ฝั่ง client ใช้ `socket.io-client`
- init socket ตอน component mount
- cleanup ด้วย `disconnect()` ตอน unmount
- return instance สำหรับเรียก `emit` และ `on`

โค้ดอ้างอิง:
- `src/hooks/useSocket.ts`

---

## 10) ทำหน้า Patient (`/patient`)

### 10.1 สร้างหน้า

ไฟล์: `src/app/patient/page.tsx`
- render `Header` + `PatientForm`
- layout ให้ responsive

### 10.2 สร้างคอมโพเนนต์ `PatientForm`

ไฟล์: `src/components/PatientForm.tsx`

สิ่งที่ต้องมี:
1. State ของฟอร์มทุก field
2. State ของ status (`idle`, `typing`, `submitted`)
3. realtime validation (Zod)
4. State สำหรับ `touched fields` และ `submit attempt`
5. debounce ส่ง `patient:update`
6. ส่ง `patient:status`
7. ตอน submit ส่ง `patient:submit`
8. แสดง error แบบ hybrid:
   - ยังไม่โชว์ error ตอนเปิดหน้าครั้งแรก
   - โชว์เฉพาะ field ที่ touch/blur แล้ว
   - กด submit ให้โชว์ error ที่เหลือทั้งหมด
9. รองรับมือถือ/เดสก์ท็อป

โค้ดอ้างอิง:
- `src/components/PatientForm.tsx`

---

## 11) ทำหน้า Staff (`/staff`)

### 11.1 สร้างหน้า

ไฟล์: `src/app/staff/page.tsx`

ประกอบด้วย:
- `StaffSidebar`
- `StaffMetrics`
- `ActiveQueue`
- `StaffDashboard`

### 11.2 ทำ dashboard รับข้อมูล realtime

ไฟล์: `src/components/StaffDashboard.tsx`

สิ่งที่ต้องมี:
1. `socket.on("patient:update")`
2. `socket.on("patient:status")`
3. `socket.on("patient:submit")`
4. cleanup `socket.off(...)`
5. แสดง field ทั้งหมดจาก payload
6. badge สถานะ
7. คำนวณอายุจาก DOB
8. fallback idle เมื่อไม่มี activity

โค้ดอ้างอิง:
- `src/components/StaffDashboard.tsx`

---

## 12) ทำหน้า Landing (`/`)

ไฟล์: `src/app/page.tsx`

ใส่การ์ดลิงก์ไป:
- `/patient`
- `/staff`

โค้ดอ้างอิง:
- `src/app/page.tsx`

---

## 13) ตั้งค่า style กลาง

ไฟล์: `src/app/globals.css`

- import tailwind
- สร้าง color token ที่ใช้ในระบบ
- ตรวจให้แน่ใจว่า text / placeholder อ่านง่าย

ไฟล์: `src/app/layout.tsx`

- ใส่ font และ class ที่ต้องใช้ทั้งแอป

---

## 14) รันโปรเจกต์

```bash
npm install
npm run dev
```

เปิด:
- `http://localhost:3000`
- `http://localhost:3000/patient`
- `http://localhost:3000/staff`

ทดสอบง่ายที่สุด:
1. เปิด 2 แท็บพร้อมกัน (Patient + Staff)
2. พิมพ์ในฟอร์ม patient
3. ดู staff ว่าอัปเดตทันที

---

## 15) ตรวจคุณภาพก่อนส่งงาน

```bash
npm run lint
```

สิ่งที่ควรเช็กเพิ่ม:
- ข้อมูลครบทุก field ตามโจทย์
- validation ทำงานจริง
- responsive ทั้งมือถือและ desktop
- ไม่มี error ใน console

---

## 16) Build และรันแบบ production

```bash
npm run build
npm run start
```

---

## 17) Deploy (คำแนะนำ)

โปรเจกต์นี้ใช้ custom server (`server.js`) จึงเหมาะกับ platform ที่รัน Node server ต่อเนื่อง เช่น:
- Render
- Railway
- Heroku

ถ้าใช้ Vercel ต้องแยก realtime backend เพิ่ม (เพราะ serverless ไม่เหมาะกับ Socket.IO รูปแบบนี้)

---

## 18) ปัญหาที่มือใหม่เจอบ่อย + วิธีแก้

### ปัญหา 1: เปิด staff แล้วไม่เห็นข้อมูล
- เช็กว่าเปิด patient อีกแท็บและกำลังพิมพ์จริง
- เช็กว่า `npm run dev` ใช้ `node server.js` จริง
- เช็ก console ว่ามี `Client connected` หรือไม่

### ปัญหา 2: validation ไม่ขึ้น
- เช็กว่าฟอร์มยิงผ่าน `patientSchema.safeParse(...)`
- เช็ก mapping ของ error path

### ปัญหา 3: ข้อมูลส่งแล้วแต่ status ไม่เปลี่ยน
- เช็กว่าฝั่ง patient emit `patient:status`
- เช็กว่าฝั่ง server broadcast `patient:status`
- เช็กว่าฝั่ง staff subscribe event นี้

### ปัญหา 4: ขึ้น error ทุกช่องตั้งแต่ยังไม่เริ่มกรอก
- เช็กว่ามี state `touched fields` และ `submit attempt`
- เช็กว่าเงื่อนไข render error ใช้ `(touched || submitted)`

---

## 19) ลำดับการพัฒนาแนะนำสำหรับมือใหม่

1. ทำหน้า UI เปล่าๆ ให้ครบก่อน
2. ใส่ state ฟอร์มให้กรอกได้
3. ใส่ validation
4. ใส่ socket ให้ส่ง/รับข้อมูล
5. เก็บงาน responsive
6. lint + ทดสอบทุก flow
7. ค่อย deploy

---

## 20) แหล่งอ้างอิงไฟล์จริงของโปรเจกต์นี้

- `server.js`
- `src/components/PatientForm.tsx`
- `src/components/StaffDashboard.tsx`
- `src/utils/validators.ts`
- `src/app/patient/page.tsx`
- `src/app/staff/page.tsx`
- `src/app/page.tsx`
- `README.md`

> แนะนำ: อ่านไฟล์ตามลำดับข้างบน จะเข้าใจโครงสร้างระบบได้เร็วสุด
