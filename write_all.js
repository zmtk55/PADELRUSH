const fs=require("fs");
const wf=(path,content)=>{fs.writeFileSync(path,content);console.log("OK:"+path.split("/").pop())};
