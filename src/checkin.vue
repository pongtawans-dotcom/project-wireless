<template>

<div class="checkin">

<h2>Student Check-in</h2>

<input v-model="studentID" placeholder="Student ID">

<button @click="checkin">
Check In
</button>

<p v-if="success">เช็คชื่อสำเร็จ</p>

</div>

</template>


<script>

import { ref as dbRef, set } from "firebase/database"
import { db } from "./firebase"

export default{

data(){
return{
studentID:"",
room:"",
subject:"",
date:"",
success:false
}
},

mounted(){

const url = new URL(window.location.href)

this.room = url.searchParams.get("room")
this.subject = url.searchParams.get("subject")
this.date = url.searchParams.get("date")

},

methods:{

async checkin(){

if(!this.studentID){
alert("กรอกรหัสนักศึกษา")
return
}

const now = new Date()

const time =
now.getHours().toString().padStart(2,"0")+":"+
now.getMinutes().toString().padStart(2,"0")+":"+
now.getSeconds().toString().padStart(2,"0")

const path =
`attendance/${this.date}/${this.subject}/${this.room}/${this.studentID}`

await set(dbRef(db,path),{
time:time
})

this.success=true

}

}

}

</script>