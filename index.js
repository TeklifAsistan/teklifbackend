const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())


app.get("/",(req,res)=>{
    res.json("Hello from sql backend")
})

app.listen(process.env.PORT || 4747,()=>{
    console.log("teklif backend running !")
});