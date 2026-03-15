```vue
<template>

<div class="login">

<h2>Student Check-in</h2>

<div class="form">

<input v-model="subject" placeholder="รหัสวิชา เช่น 00422012">

<input v-model="room" placeholder="ห้อง เช่น 9524">

<input v-model="student" placeholder="รหัสนักศึกษา เช่น 673380XXX-X">

<button @click="generateUUID">
Generate UUID
</button>

<button class="next-btn" @click="goNext">
ไปหน้าระบบ
</button>

</div>

<div v-if="uuid" class="uuid-box">

<p>UUID</p>
<b>{{ uuid }}</b>

<button @click="startBLE">
เปิด Bluetooth เช็คชื่อ
</button>

</div>

<div v-if="success" class="popup">

✅ เช็คชื่อสำเร็จ

<button @click="goApp">
เข้าสู่ระบบ
</button>

</div>

</div>

</template>


<script>

import { BleClient } from '@capacitor-community/bluetooth-le'
import { Capacitor } from '@capacitor/core'
console.log("Platform:", Capacitor.getPlatform())
export default{

data(){
return{
subject:"",
room:"",
student:"",
uuid:"",
success:false
}
},

methods:{


generateUUID(){

if(!this.subject || !this.room || !this.student){

alert("กรอกข้อมูลให้ครบ")
return

}

let id=this.student.replace("-","")
id=id.padStart(12,"0")

this.uuid =
this.subject +
"-" +
this.room +
"-0000-0000-" +
id

},


async startBLE(){

if(!this.uuid){
alert("ต้อง generate UUID ก่อน")
return
}

try{

// เริ่ม Bluetooth
await BluetoothLe.initialize()

// ขอ permission จาก Android
await BluetoothLe.requestPermissions()

// เปิด Bluetooth
await BluetoothLe.enable()

// เริ่ม broadcast UUID
await BluetoothLe.startAdvertising({

services:[this.uuid],
localName:"KKU-Checkin"

})

this.success=true

}catch(err){

console.log(err)
alert("Bluetooth Error: "+JSON.stringify(err))

}

},


goApp(){
window.location.href="/"
},


goNext(){
window.location.href="App.vue"
}

}

}

</script>


<style>

.login{
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
height:100vh;
background:#f4f6f9;
}

.form{
display:flex;
flex-direction:column;
width:320px;
gap:10px;
}

input{
padding:10px;
border:1px solid #ddd;
border-radius:6px;
}

button{
padding:10px;
background:#ff7a00;
border:none;
color:white;
border-radius:6px;
cursor:pointer;
}

.next-btn{
background:#444;
}

.uuid-box{
margin-top:20px;
text-align:center;
}

.uuid-box b{
display:block;
margin-top:10px;
word-break:break-all;
}

.popup{
margin-top:30px;
color:green;
font-size:22px;
text-align:center;
}

</style>
```
