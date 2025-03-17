import connectDB from "./db/index.js";
import {app} from "./app.js"

connectDB()
    .then(()=>{
        app.on("error",(error)=>{
            console.log("server connection error", error);
        });
        app.listen(process.env.PORT || 8000,()=>{
            console.log(`📡 server is listing at localhost:${process.env.PORT}`);
        })
    }) 
    .catch((error)=>{
        console.log("mongoDB connection failed!!", error);
    });

    