<template>
  <div style="padding:20px">
    <h1>เลือกห้องเรียน</h1>

    <button @click="openRoom('9524')">9524</button>
    <button @click="openRoom('9525')">9525</button>

    <!-- ================= MODAL ================= -->
    <div v-if="showModal" class="overlay">
      <div class="modal">

        <h2>ห้อง {{ selectedRoom }}</h2>

        <div style="margin-bottom:15px">
          <input type="date" v-model="selectedDate" />

          <!-- START TIME (24 ชม ไทย) -->
          <select v-model="startHour">
            <option v-for="h in 24" :key="'sh'+h" :value="formatNumber(h-1)">
              {{ formatNumber(h-1) }}
            </option>
          </select>
          :
          <select v-model="startMinute">
            <option v-for="m in 60" :key="'sm'+m" :value="formatNumber(m-1)">
              {{ formatNumber(m-1) }}
            </option>
          </select>

          -

          <!-- END TIME -->
          <select v-model="endHour">
            <option v-for="h in 24" :key="'eh'+h" :value="formatNumber(h-1)">
              {{ formatNumber(h-1) }}
            </option>
          </select>
          :
          <select v-model="endMinute">
            <option v-for="m in 60" :key="'em'+m" :value="formatNumber(m-1)">
              {{ formatNumber(m-1) }}
            </option>
          </select>

          <button @click="loadData">Load</button>
        </div>

        <h3 v-if="students.length > 0">
          Total: {{ students.length }} คน
        </h3>

        <table v-if="students.length > 0" border="1" width="100%" style="margin-top:15px">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td>{{ student.id }}</td>
              <td>{{ student.time }}</td>
              <td :style="statusColor(student.status)">
                {{ student.status }}
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="students.length === 0 && loaded">
          No Data
        </p>

        <div v-if="students.length > 0" style="margin-top:20px">
          <button @click="exportExcel">Export Excel</button>
          <button @click="exportPDF">Export PDF</button>
        </div>

        <br />
        <button @click="closeModal">ปิด</button>

      </div>
    </div>
  </div>
</template>

<script>
import { ref as dbRef, get } from "firebase/database";
import { db } from "./firebase";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default {
  data() {
    return {
      selectedRoom: "",
      selectedDate: "",

      startHour: "08",
      startMinute: "00",
      endHour: "09",
      endMinute: "00",

      students: [],
      loaded: false,
      showModal: false,
    };
  },

  methods: {

    formatNumber(num) {
      return num.toString().padStart(2, "0");
    },

    timeToMinutes(hour, minute) {
      return parseInt(hour) * 60 + parseInt(minute);
    },

    formatThaiTime(timeStr) {
      const parts = timeStr.split(":");
      return `${parts[0]}:${parts[1]} น.`;
    },

    openRoom(room) {
      this.selectedRoom = room;
      this.showModal = true;
      this.students = [];
      this.loaded = false;
    },

    closeModal() {
      this.showModal = false;
    },

    async loadData() {

      if (!this.selectedDate) {
        alert("กรุณาเลือกวันที่");
        return;
      }

      const start = this.timeToMinutes(this.startHour, this.startMinute);
      const end = this.timeToMinutes(this.endHour, this.endMinute);

      if (start >= end) {
        alert("เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด");
        return;
      }

      this.students = [];
      this.loaded = false;

      const subject = "00422012";
      const path = `attendance/${this.selectedDate}/${subject}/${this.selectedRoom}`;

      const snapshot = await get(dbRef(db, path));

      if (snapshot.exists()) {
        const data = snapshot.val();

        for (let id in data) {

          const studentTime = data[id].time;
          const parts = studentTime.split(":");
          const studentMinutes =
            parseInt(parts[0]) * 60 + parseInt(parts[1]);

          let status = "";

          if (studentMinutes <= end) {
            status = "On Time";
          } else {
            status = "Absent";
          }

          this.students.push({
            id: id,
            time: studentTime.substring(0,5),
            status: status,
          });
        }

        this.students.sort((a, b) => {
          return a.time.localeCompare(b.time);
        });
      }

      this.loaded = true;
    },

    statusColor(status) {
      if (status === "On Time") return "color: green; font-weight:bold";
      if (status === "Absent") return "color: red; font-weight:bold";
      return "";
    },

    exportExcel() {
      const data = this.students.map((s) => ({
        StudentID: s.id,
        Time: s.time,
        Status: s.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `attendance_${this.selectedRoom}_${this.selectedDate}.xlsx`);
    },

    exportPDF() {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(`Attendance Room ${this.selectedRoom}`, 14, 15);
  doc.text(`Date: ${this.selectedDate}`, 14, 22);
  doc.text(
    `Time: ${this.startHour}:${this.startMinute} - ${this.endHour}:${this.endMinute}`,
    14,
    29
  );

  const tableData = this.students.map((s) => [
    s.id,
    s.time,
    s.status
  ]);

  autoTable(doc, {
    head: [["Student ID", "Time", "Status"]],
    body: tableData,
    startY: 35,
  });

  doc.save(`attendance_${this.selectedRoom}_${this.selectedDate}.pdf`);
}
  },
};
</script>

<style>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 40px;
  border-radius: 16px;
  width: 800px;
  max-width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}
</style>