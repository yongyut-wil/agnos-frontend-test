# คู่มือการสร้างแอปพลิเคชัน Real-time Patient Intake (ฉบับจับมือทำ)

คู่มือนี้จะสอนคุณสร้างแอปพลิเคชันลงทะเบียนผู้ป่วย (Patient Intake) ที่มีการซิงค์ข้อมูลแบบ Real-time ไปยังหน้าจอเจ้าหน้าที่ (Staff Dashboard) โดยใช้เทคโนโลยี **Next.js**, **TailwindCSS**, และ **Socket.io**

## สิ่งที่คุณจะได้เรียนรู้
1.  การตั้งค่า Next.js Project พร้อม Custom Server
2.  การติดตั้งและใช้งาน Socket.io เพื่อรับส่งข้อมูลแบบ Real-time
3.  การสร้างฟอร์มที่มีการตรวจสอบความถูกต้อง (Validation) ด้วย Zod
4.  การออกแบบหน้าจอ UI ด้วย TailwindCSS

---

## ขั้นตอนที่ 1: ติดตั้ง Node.js และสร้างโปรเจกต์

ก่อนเริ่ม คุณต้องมี **Node.js** (เวอร์ชัน 18 ขึ้นไป) ติดตั้งในเครื่อง

1.  เปิด Terminal (Command Prompt หรือ PowerShell)
2.  สร้างโฟลเดอร์สำหรับโปรเจกต์และสร้าง Next.js app ใหม่:

```bash
npx create-next-app@latest agnos-app
```

ระบบจะถามคำถาม ให้ตอบตามนี้:
- **Would you like to use TypeScript?** → Yes
- **Would you like to use ESLint?** → Yes
- **Would you like to use Tailwind CSS?** → Yes
- **Would you like to use `src/` directory?** → Yes
- **Would you like to use App Router?** → Yes
- **Would you like to customize the default import alias (@/*)?** → No

3.  เข้าไปในโฟลเดอร์โปรเจกต์:

```bash
cd agnos-app
```

---

## ขั้นตอนที่ 2: ติดตั้ง Dependencies ที่จำเป็น

เราต้องใช้ **Socket.io** สำหรับการสื่อสาร Real-time, **Lucide React** สำหรับไอคอน, และ **Zod** สำหรับตรวจสอบข้อมูล

```bash
npm install socket.io socket.io-client lucide-react zod
```

---

## ขั้นตอนที่ 3: ตั้งค่า Custom Server (หัวใจสำคัญของ WebSocket)

Next.js ปกติทำงานบน Serverless Environment ซึ่งไม่รองรับ WebSocket ที่ต้องมีการเชื่อมต่อค้างไว้ตลอดเวลา เราจึงต้องสร้าง Custom Server ด้วย Node.js

1.  สร้างไฟล์ชื่อ `server.js` ไว้ที่ **รากของโปรเจกต์** (ระดับเดียวกับ `package.json`):

```javascript
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// เตรียม Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // สร้าง HTTP Server ปกติ
  const httpServer = createServer(handle);

  // สร้าง Socket.io Server เชื่อมกับ HTTP Server
  const io = new Server(httpServer);

  // ฟังเหตุการณ์เมื่อมีคนเชื่อมต่อเข้ามา
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // สร้างห้องแยกสำหรับ Staff
    socket.on("join:staff", () => {
      socket.join("staff");
      console.log("Staff joined room");
    });

    // เมื่อ Patient ส่งข้อมูลอัปเดตมา (patient:update)
    socket.on("patient:update", (data) => {
      // ส่งต่อข้อมูลไปให้ทุกคนในห้อง Staff (staff)
      io.to("staff").emit("patient:update", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // รัน Server ที่ port 3000
  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

2.  แก้ไขไฟล์ `package.json` เพื่อให้รัน `server.js` แทนคำสั่งปกติ:

เปลี่ยนบรรทัด `"dev": "next dev"` เป็น:

```json
"scripts": {
  "dev": "node server.js",
  "build": "next build",
  "start": "NODE_ENV=production node server.js",
  "lint": "next lint"
},
```

---

## ขั้นตอนที่ 4: สร้าง Type Definitions และ Validation (Zod)

เพื่อความถูกต้องของข้อมูล เราจะกำหนดโครงสร้างข้อมูลผู้ป่วย

1.  สร้างไฟล์ `src/types/patient.ts`:

```typescript
export interface Patient {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender: string;
    phone: string;
    email: string;
    address: string;
    preferredLanguage: string;
    nationality: string;
    religion?: string;
}
```

2.  สร้างไฟล์ `src/utils/validators.ts`:

```typescript
import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  gender: z.string().min(1, "Gender is required"),
  // เพิ่ม field อื่นๆ ตามต้องการ
});
```

---

## ขั้นตอนที่ 5: สร้าง Hook สำหรับเชื่อมต่อ Socket

เพื่อไม่ให้โค้ดซ้ำซ้อน เราจะสร้าง React Hook กลางไว้เรียกใช้ Socket

สร้างไฟล์ `src/hooks/useSocket.ts`:

```typescript
"use client";

import { useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  // เชื่อมต่อเพียงครั้งเดียว (useMemo)
  const socket = useMemo(() => io({
    path: '/socket.io', // ต้องตรงกับ server.js
  }), []);

  useEffect(() => {
    return () => {
      socket.disconnect(); // ตัดการเชื่อมต่อเมื่อปิดหน้าเว็บ
    };
  }, [socket]);

  return socket;
};
```

---

## ขั้นตอนที่ 6: สร้างหน้าจอ Patient Form (ฝั่งผู้ป่วย)

หน้านี้จะส่งข้อมูลไปยัง Server ทุกครั้งที่ผู้ใช้พิมพ์ (Debounce 300ms)

สร้างไฟล์ `src/components/PatientForm.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { patientSchema } from "@/utils/validators";

export default function PatientForm() {
  const socket = useSocket();
  const [formData, setFormData] = useState({ fullName: "", dateOfBirth: "", gender: "" });

  // ส่งข้อมูลเมื่อมีการแก้ไข (รอ 300ms หลังหยุดพิมพ์)
  useEffect(() => {
    if (!socket) return;
    const timeoutId = setTimeout(() => {
      // แปลงชื่อเต็มเป็น First/Last Name อย่างง่าย
      const parts = formData.fullName.trim().split(" ");
      const payload = {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      };

      // ส่งข้อมูลไป Server
      socket.emit("patient:update", payload);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData, socket]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Patient Intake Form</h1>
      <form className="space-y-4">
        <div>
            <label className="block font-bold mb-1">Full Name</label>
            <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
                placeholder="John Doe"
            />
        </div>
        <div>
            <label className="block font-bold mb-1">Date of Birth</label>
            <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
            />
        </div>
        <div>
            <label className="block font-bold mb-1">Gender</label>
            <div className="flex gap-4">
                {['Male', 'Female', 'Other'].map(g => (
                    <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({...formData, gender: g})}
                        className={`px-4 py-2 border rounded ${formData.gender === g ? 'bg-blue-500 text-white' : 'bg-white'}`}
                    >
                        {g}
                    </button>
                ))}
            </div>
        </div>
      </form>
    </div>
  );
}
```

---

## ขั้นตอนที่ 7: สร้างหน้าจอ Staff Dashboard (ฝั่งเจ้าหน้าที่)

หน้านี้จะรับข้อมูล Real-time มาแสดงผล

สร้างไฟล์ `src/components/StaffDashboard.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Patient } from "@/types/patient";

export default function StaffDashboard() {
  const socket = useSocket();
  const [patient, setPatient] = useState<Partial<Patient> | null>(null);

  useEffect(() => {
    if (!socket) return;

    // แจ้ง Server ว่าฉันคือ Staff
    socket.emit("join:staff");

    // รอรับข้อมูลอัปเดต
    socket.on("patient:update", (data) => {
      setPatient(data);
    });

    return () => {
      socket.off("patient:update");
    };
  }, [socket]);

  if (!patient) return <div className="p-10 text-center">Waiting for patient...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Live Patient Monitor</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg grid grid-cols-3 gap-8">
        <div>
            <span className="text-gray-500 text-sm uppercase">Patient Name</span>
            <h2 className="text-2xl font-bold">{patient.firstName} {patient.lastName}</h2>
        </div>
        <div>
            <span className="text-gray-500 text-sm uppercase">Date of Birth</span>
            <h2 className="text-2xl font-bold">{patient.dateOfBirth || "--"}</h2>
        </div>
        <div>
            <span className="text-gray-500 text-sm uppercase">Gender</span>
            <h2 className="text-2xl font-bold">{patient.gender || "--"}</h2>
        </div>
      </div>
    </div>
  );
}
```

---

## ขั้นตอนที่ 8: สร้าง Page Route

สุดท้าย เชื่อมโยง Components เข้ากับหน้าเว็บจริง

1.  **หน้า Patient:** แก้ไข `src/app/patient/page.tsx`:
```tsx
import PatientForm from "@/components/PatientForm";

export default function Page() {
  return <PatientForm />;
}
```

2.  **หน้า Staff:** แก้ไข `src/app/staff/page.tsx`:
```tsx
import StaffDashboard from "@/components/StaffDashboard";

export default function Page() {
  return <StaffDashboard />;
}
```

---

## ขั้นตอนที่ 9: ทดสอบการทำงาน

1.  รันเซิร์ฟเวอร์:
```bash
npm run dev
```

2.  เปิด Browser ขึ้นมา 2 หน้าต่าง (หรือ 2 Tabs):
    *   หน้าต่างที่ 1: `http://localhost:3000/staff` (จะเห็นคำว่า Waiting...)
    *   หน้าต่างที่ 2: `http://localhost:3000/patient`

3.  ลองพิมพ์ชื่อในหน้า **Patient**
4.  คุณจะเห็นชื่อปรากฏขึ้นทีละตัวอักษร (หลังจากหยุดพิมพ์แป๊บเดียว) บนหน้า **Staff** ทันที!

---

## สรุป
คุณได้สร้างระบบ Real-time Web Application ด้วย Next.js และ Socket.io เรียบร้อยแล้ว! โครงสร้างนี้สามารถนำไปต่อยอดได้ เช่น:
*   เพิ่ม Database (PostgreSQL/MongoDB) เพื่อบันทึกข้อมูลเมื่อกด Submit
*   เพิ่ม Authentication ให้เฉพาะหมอเข้าหน้า Staff ได้
*   เพิ่มห้อง (Room) สำหรับผู้ป่วยหลายคน
