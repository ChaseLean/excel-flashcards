var fs = require('fs');
const express = require("express");
const multer = require("multer");
const excelToJson = require('convert-excel-to-json');

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening at ${port}`));
app.use(express.static("public"));
app.use(express.json({limit: "1mb"}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, "source.xlsx");
    }
})
const upload = multer({ storage: storage });

app.get("/api", (request, response) => {
    const files = fs.readdirSync('uploads');
    const result = excelToJson({
        sourceFile: `uploads\\${files[0]}`,
        header:{
            rows: 1
        },
        columnToKey: {
            '*': '{{columnHeader}}'
        }
    });
    response.json(result);
})

app.get("/api-headers", (request, response) => {
    const files = fs.readdirSync('uploads');
    const result = excelToJson({
        sourceFile: `uploads\\${files[0]}`,
        range: 'A1:Z1'
    });

    for (let sheet in result) {
        headers = []
        for(let key in result[sheet][0]){
            headers.push(result[sheet][0][key])
        }
        result[sheet] = headers
    }
    response.json(result);
});

app.post("/upload", upload.single("spreadsheet"), (request, response) => {
    response.json({status: "OK"});
})