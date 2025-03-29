import connectDB from "./db/index.js";
import {app} from "./app.js"

connectDB()
    .then(()=>{
        app.on("error",(error)=>{
            console.log("server connection error", error);
        });
        app.listen(process.env.PORT,()=>{
            console.log(`📡 server is listing at http://localhost:${process.env.PORT}`);
        })
    }) 
    .catch((error)=>{
        console.log("mongoDB connection failed!!", error);
    });

    