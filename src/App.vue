<template>

<Checkin v-if="isCheckin"/>

<div v-else class="layout">

<!-- SIDEBAR -->

<div class="sidebar">

<div class="logo">
KKU
</div>

<div class="menu">

<button @click="page='check'">เช็คชื่อ</button>
<button @click="page='students'">รายชื่อ</button>
<button @click="page='teacher'">อาจารย์ประจำวิชา</button>
<button @click="page='ta'">TA</button>
<button @click="page='dev'">ผู้พัฒนา</button>
<button @click="page='qr'">QR Code</button>

</div>

</div>


<!-- MAIN -->

<div class="main">

<div class="header">
<h2>ระบบเช็คชื่อนักศึกษา มหาวิทยาลัยขอนแก่น</h2>
</div>


<!-- PAGE CHECK -->

<div v-if="page=='check'">

<div class="dashboard">

<div class="card">

<h3>Daily Overview</h3>

<p>วันที่: {{ selectedDate || "-" }}</p>
<p>ห้อง: {{ selectedRoom || "-" }}</p>

</div>


<div class="card">

<h3>Attendance Summary</h3>

<div class="summary">

<div class="circle green">
{{ presentPercent }}%
<span>Present</span>
</div>

<div class="circle orange">
{{ latePercent }}%
<span>Late</span>
</div>

<div class="circle gray">
{{ excusedPercent }}%
<span>Excused</span>
</div>

<div class="circle red">
{{ absentPercent }}%
<span>Absent</span>
</div>

</div>

</div>

</div>



<div class="card">

<h3>เช็ครายชื่อ</h3>

<div class="controls">

<select v-model="selectedRoom">
<option disabled value="">เลือกห้อง</option>
<option>9524</option>
<option>9525</option>
</select>

<input type="date" v-model="selectedDate">


<select v-model="startHour">
<option v-for="h in 24" :value="formatNumber(h-1)">
{{ formatNumber(h-1) }}
</option>
</select>

:

<select v-model="startMinute">
<option v-for="m in 60" :value="formatNumber(m-1)">
{{ formatNumber(m-1) }}
</option>
</select>


-

<select v-model="endHour">
<option v-for="h in 24" :value="formatNumber(h-1)">
{{ formatNumber(h-1) }}
</option>
</select>

:

<select v-model="endMinute">
<option v-for="m in 60" :value="formatNumber(m-1)">
{{ formatNumber(m-1) }}
</option>
</select>


<button @click="loadData">
Load
</button>

</div>



<table v-if="students.length">

<thead>

<tr>
<th>Student ID</th>
<th>Time</th>
<th>Status</th>
</tr>

</thead>


<tbody>

<tr v-for="s in students" :key="s.id">

<td>{{ s.id }}</td>
<td>{{ s.time }}</td>

<td :class="statusClass(s.status)">
{{ s.status }}
</td>

</tr>

</tbody>

</table>


<p v-if="students.length==0 && loaded">
No Data
</p>


<div v-if="students.length" class="export">

<button @click="exportExcel">
Export Excel
</button>

<button @click="exportPDF">
Export PDF
</button>

</div>


</div>

</div>


<!-- PAGE STUDENTS -->

<div v-if="page=='students'" class="card">

<h3>รายชื่อนักศึกษา</h3>

<table border="1" width="100%">
<thead>
<tr>
<th>ลำดับ</th>
<th>รหัสนักศึกษา</th>
<th>ชื่อ</th>
<th>Section</th>
</tr>
</thead>

<tbody>
<tr v-for="(s,index) in students" :key="s.id">
<td>{{ index+1 }}</td>
<td>{{ s.id }}</td>
<td>{{ s.name }}</td>
<td>{{ s.sec }}</td>
</tr>
</tbody>

</table>

</div>


<!-- PAGE TEACHER -->

<div v-if="page=='teacher'" class="card teacher-card">

  <img src="/src/assets/teacher.png" class="teacher-img">

  <div class="teacher-info">
    <p><b>ชื่อ:</b> Chakchai So-In</p>
    <p>Professor of Computer Science</p>
    <p>Khon Kaen University</p>
  </div>

</div>


<!-- PAGE TA -->

<div v-if="page=='ta'" class="card">

<h3>TA สุดหล่อ</h3>

  <ul class="dev-list">
    <li>กวีเกียรติ มงคลพันธ์ุ</li>
   <li>Kritsakorn Coat-ngam</li>
  </ul>

</div>


<!-- PAGE DEV -->

<div v-if="page=='dev'" class="card">

  <h3>ผู้พัฒนา</h3>

  <p><b>Wireless Section 3</b></p>

  <ul class="dev-list">
    <li>673380545-2 นาย ธนวิชญ์ ธนูสา</li>
    <li>673380376-9 นาย พงศ์ตะวัน โสสีทา</li>
    <li>673380540-2 นาย ชลชยพงษ์ ชวลิตเมธารัตน์</li>
    <li>673380551-7 นางสาว ปาลีรัตน์ สถิตพลธนานันท์</li>
    <li>673380377-7 นาย พชร ข่าขันมะลี</li>
    <li>673380553-3 นาย พลวรรธน์ ลีบุญพงศ์</li>
  </ul>

</div>


<!-- PAGE QR -->

<div v-if="page=='qr'" class="card">

<h3>สร้าง QR Code เช็คชื่อ</h3>

<div class="controls">

<select v-model="qrRoom">
<option disabled value="">เลือกห้อง</option>
<option>9524</option>
<option>9525</option>
</select>

<input type="date" v-model="qrDate">

<select v-model="qrSubject">
<option disabled value="">เลือกรหัสวิชา</option>
<option value="00422012">00422012</option>
<option value="00422013">00422013</option>
</select>

<button @click="generateQR">สร้าง QR</button>

</div>

<!-- QR CODE -->
<div v-if="qrData" class="qr-big">
<qrcode-vue :value="qrData" :size="500" />
</div>
<div v-if="qrLink" style="margin-top:20px">

<qrcode-vue :value="qrLink" :size="220"></qrcode-vue>

<p style="margin-top:10px">
{{ qrLink }}
</p>

</div>

</div>


</div>

</div>

</template>



<script>
import Checkin from "./checkin.vue"
import { ref as dbRef, get } from "firebase/database"
import { db } from "./firebase"

import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import QrcodeVue from "qrcode.vue"

export default{

components:{
QrcodeVue,
Checkin
},

data(){

return{

page:"check",
isCheckin:false,
selectedRoom:"",
selectedDate:"",

startHour:"08",
startMinute:"00",

endHour:"09",
endMinute:"00",

students:[
{ id:"673380363-8", name:"นายกฤษณพงษ์ วีระชาติ", sec:"A6702" },
{ id:"673380364-6", name:"นายกันตภูมิ เดาขุนทด", sec:"A6702" },
{ id:"673380365-4", name:"นายกิจภานัทธ์ นามโยธา", sec:"A6702" },
{ id:"673380366-2", name:"นายคงกระพัน ลือชา", sec:"A6702" },
{ id:"673380367-0", name:"นายจีราวัฒน์ วงษ์คำจันทร์", sec:"A6702" },
{ id:"673380368-8", name:"นายชนพงศ์ ขันทะเนตร์", sec:"A6702" },
{ id:"673380369-6", name:"นายณัฐนนท์ เนาวรัตน์", sec:"A6702" },
{ id:"673380370-1", name:"นายณัฐพงศ์ พระสว่าง", sec:"A6702" },
{ id:"673380371-9", name:"นางสาวธนัชญา ชายพระอินทร์", sec:"A6702" },
{ id:"673380372-7", name:"นายปรเมษฐ์ ร่องบุตรศรี", sec:"A6702" },
{ id:"673380373-5", name:"นางสาวปาณิศา ตะโม", sec:"A6702" },
{ id:"673380374-3", name:"นางสาวปาริชาติ ชะนะมูล", sec:"A6702" },
{ id:"673380375-1", name:"นายปารุสก์ เหรียญทอง", sec:"A6702" },
{ id:"673380376-9", name:"นายพงศ์ตะวัน โสสีทา", sec:"A6702" },
{ id:"673380377-7", name:"นายพชร ข่าขันมะลี", sec:"A6702" },
{ id:"673380378-5", name:"นายพชร ทับมั่นนวพร", sec:"A6702" },
{ id:"673380379-3", name:"นางสาวพรกนก เครือเทียน", sec:"A6702" },
{ id:"673380380-8", name:"นายพีรพัฒ บุญอาจ", sec:"A6702" },
{ id:"673380381-6", name:"นายวีรภัทร ภูกองไชย", sec:"A6702" },
{ id:"673380382-4", name:"นายศุภวิชญ์ ภาควุฒิ", sec:"A6702" },
{ id:"673380383-2", name:"นายสหพล พรหมศร", sec:"A6702" },
{ id:"673380384-0", name:"นายสิริภัทร พิมทอง", sec:"A6702" },
{ id:"673380385-8", name:"นายสุกฤษ อารีป้อม", sec:"A6702" },
{ id:"673380386-6", name:"นายอชิระ ศรีหรั่งไพโรจน์", sec:"A6702" },
{ id:"673380387-4", name:"นางสาวอาฐิรตา รัตนกุล", sec:"A6702" },

{ id:"673380535-5", name:"นางสาวกชามาส รอบวนานิยม", sec:"A6703" },
{ id:"673380536-3", name:"นางสาวกัญญาณัฐ รัตนประทุม", sec:"A6703" },
{ id:"673380537-1", name:"นายจรรยวรรธน์ หัสคุณ", sec:"A6703" },
{ id:"673380538-9", name:"นายฉันทวัฒน์ ชานนท์", sec:"A6703" },
{ id:"673380539-7", name:"นายชยานนท์ ธำรงศรีสกุล", sec:"A6703" },
{ id:"673380540-2", name:"นายชลชยพงษ์ ชวลิตเมธารัตน์", sec:"A6703" },
{ id:"673380541-0", name:"นายชิษณุพงศ์ จิตมาลย์", sec:"A6703" },
{ id:"673380542-8", name:"นายดิชพล มณีวรรณ์", sec:"A6703" },
{ id:"673380543-6", name:"นางสาวทิพย์ธัญญา ทองเงิน", sec:"A6703" },
{ id:"673380544-4", name:"นายธนภัทร ประสานพันธ์", sec:"A6703" },
{ id:"673380545-2", name:"นายธนวิชญ์ ธนูสา", sec:"A6703" },
{ id:"673380546-0", name:"นางสาวธัญญารัตน์ ลงเย", sec:"A6703" },
{ id:"673380547-8", name:"นายนันทสิทธิ์ ศรีลับแล", sec:"A6703" },
{ id:"673380548-6", name:"นายปริณ ปริบุญณะ", sec:"A6703" },
{ id:"673380549-4", name:"นายปองพล หอระตะ", sec:"A6703" },
{ id:"673380550-9", name:"นายปัณณพัฒน์ อนุชน", sec:"A6703" },
{ id:"673380551-7", name:"นางสาวปาลีรัตน์ สถิตพลธนานันท์", sec:"A6703" },
{ id:"673380552-5", name:"นายพร้อมพงศ์ ศรีสวาสดิ์", sec:"A6703" },
{ id:"673380553-3", name:"นายพลวรรธน์ ลีบุญพงศ์", sec:"A6703" },
{ id:"673380554-1", name:"นางสาวพลอยไพริน จันทะคุณ", sec:"A6703" },
{ id:"673380555-9", name:"นางสาวพิมพ์พิศา สุขสโมสร", sec:"A6703" },
{ id:"673380556-7", name:"นางสาวพิมพ์มาดา เวชวงศ์", sec:"A6703" },
{ id:"673380557-5", name:"นายพีรพัฒน์ ชาญณรงค์", sec:"A6703" },
{ id:"673380558-3", name:"นายพูนทณัฐ ไชยจักร", sec:"A6703" },
{ id:"673380559-1", name:"นายภัทรพล หอมดี", sec:"A6703" },
{ id:"673380560-6", name:"นายภูมิพัฒน์ วรรณชัย", sec:"A6703" },
{ id:"673380561-4", name:"นายภูมิรพี เลิศศิวาพร", sec:"A6703" },
{ id:"673380562-2", name:"นายวัฒนะ สง่าภิญโญ", sec:"A6703" },
{ id:"673380563-0", name:"นายวิชชากร ศิริมโนพิเชษฐ์", sec:"A6703" },
{ id:"673380564-8", name:"นางสาววิมาลา สาราช", sec:"A6703" },
{ id:"673380565-6", name:"นายสกลเกียรติ จันทร์วงษา", sec:"A6703" },
{ id:"673380566-4", name:"นายสิทธิชัย ไพโรจน์", sec:"A6703" },
{ id:"673380567-2", name:"นายสุรเชษฐ พลวี", sec:"A6703" },
{ id:"673380568-0", name:"นางสาวอทิติยา โพธิ์ศรี", sec:"A6703" },
{ id:"673380569-8", name:"นางสาวเจนจิรา พรมกุล", sec:"A6703" },
{ id:"673380570-3", name:"นายเสฎฐวุฒิ บุญสถาพร", sec:"A6703" },
{ id:"673380618-1", name:"นางสาวสริษา เวธิตะ", sec:"A6703" }
],
loaded:false,

qrRoom:"",
qrDate:"",
qrSubject:"",
qrLink:""

}

},
mounted(){

if(window.location.pathname=="/checkin"){
this.isCheckin=true
}

},


computed:{


presentPercent(){

if(this.students.length==0) return 0

let p=this.students.filter(s=>s.status=="On Time").length

return Math.round((p/this.students.length)*100)

},


latePercent(){return 0},
excusedPercent(){return 0},


absentPercent(){

if(this.students.length==0) return 0

let a=this.students.filter(s=>s.status=="Absent").length

return Math.round((a/this.students.length)*100)

}

},



methods:{


formatNumber(num){
return num.toString().padStart(2,"0")
},


timeToMinutes(h,m){
return parseInt(h)*60+parseInt(m)
},



async loadData(){

if(!this.selectedRoom){
alert("เลือกห้อง")
return
}

if(!this.selectedDate){
alert("เลือกวันที่")
return
}


const end=this.timeToMinutes(this.endHour,this.endMinute)

this.students=[]
this.loaded=false


const subject="00422012"


const path=`attendance/${this.selectedDate}/${subject}/${this.selectedRoom}`


const snapshot=await get(dbRef(db,path))


if(snapshot.exists()){

const data=snapshot.val()


for(let id in data){

const t=data[id].time
const p=t.split(":")

const min=parseInt(p[0])*60+parseInt(p[1])

let status=""

if(min<=end) status="On Time"
else status="Absent"


this.students.push({

id:id,
time:t.substring(0,5),
status:status

})

}

}


this.loaded=true

},



statusClass(s){

if(s=="On Time") return "present"
if(s=="Absent") return "absent"

},



exportExcel(){

const data=this.students.map(s=>({

StudentID:s.id,
Time:s.time,
Status:s.status

}))


const ws=XLSX.utils.json_to_sheet(data)

const wb=XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb,ws,"Attendance")

const buf=XLSX.write(wb,{bookType:"xlsx",type:"array"})

const blob=new Blob([buf])

saveAs(blob,`attendance_${this.selectedRoom}.xlsx`)

},



exportPDF(){

const doc=new jsPDF()

autoTable(doc,{
head:[["Student ID","Time","Status"]],
body:this.students.map(s=>[s.id,s.time,s.status])
})

doc.save("attendance.pdf")

},



generateQR(){

if(!this.qrRoom || !this.qrDate || !this.qrSubject){
alert("กรอกข้อมูลให้ครบ")
return
}

this.qrLink =
"https://group3-project-wireless.web.app/checkin?room=" +
this.qrRoom +
"&subject=" +
this.qrSubject +
"&date=" +
this.qrDate

}

}

}

</script>



<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
}

body{
font-family:Arial;
background:#f4f6f9;
}

.layout{
display:flex;
min-height:100vh;
width:100%;
}

.sidebar{
width:250px;
background:linear-gradient(#ff8c00,#e65100);
color:white;
padding:25px;
}

.logo{
font-size:26px;
font-weight:bold;
margin-bottom:30px;
}

.menu button{
display:block;
width:100%;
margin-bottom:12px;
padding:12px;
border:none;
background:rgba(255,255,255,0.2);
color:white;
border-radius:6px;
cursor:pointer;
}

.main{
flex:1;
padding:40px;
}

.dashboard{
display:grid;
grid-template-columns:1fr 1fr;
gap:25px;
margin-bottom:25px;
}

.card{
background:white;
padding:25px;
border-radius:12px;
box-shadow:0 3px 12px rgba(0,0,0,0.08);
}

.summary{
display:flex;
justify-content:space-around;
margin-top:20px;
}

.circle{
width:90px;
height:90px;
border-radius:50%;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
font-weight:bold;
}

.circle span{
font-size:12px;
}

.green{background:#d4edda;color:#2e7d32}
.orange{background:#fff3cd;color:#f57c00}
.gray{background:#e2e3e5;color:#555}
.red{background:#f8d7da;color:#c62828}

.controls{
margin-bottom:15px;
display:flex;
gap:8px;
align-items:center;
}

table{
width:100%;
border-collapse:collapse;
margin-top:10px;
}

th,td{
padding:12px;
border-bottom:1px solid #eee;
}

.present{
color:green;
font-weight:bold;
}

.absent{
color:red;
font-weight:bold;
}

button{
margin:4px;
padding:8px 14px;
border:none;
background:#ff7a00;
color:white;
border-radius:6px;
cursor:pointer;
}

</style>