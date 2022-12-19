const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening at ${port}`));
app.use(express.static("public"));
app.use(express.json({limit: "1mb"}));


const excelToJson = require('convert-excel-to-json');

app.get("/api", (request, response) => {
    const result = excelToJson({
        sourceFile: 'german_words.xlsx',
        header:{
            rows: 1
        },
        columnToKey: {
            '*': '{{columnHeader}}'
        }
    });
    response.json(result);
})