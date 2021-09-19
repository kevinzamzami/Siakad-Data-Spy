const express = require("express");
const https = require("https");
const querystring = require('querystring');
const htmlParser = require("node-html-parser")
const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;



app.post("/",function(request,response){
    var npmMhs = request.body.npmMhs;

    // MAKING THE REQUEST
        // Form Data For SIAKAD
        var postData = querystring.stringify({
            npm: npmMhs,
            tahunaka: "ALL",
            pii: "Print"
        });


        // OPTION REQUEST TO SIAKAD
        var options = {
            host: 'siakadtik.unsika.ac.id',
            port: 443,
            method: 'POST',
            path: '/print/printkhsmhs.php',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };

        // THE REQUEST
        var req = https.request(options, function (res) {
            var result = '';
            res.on('data', function (chunk) {
                result += chunk;
            });
            res.on('end', function () {
                // Parsing the result to html object
                var root = htmlParser.parse(result);
                var tableData = root.querySelectorAll("td");
                var namaLengkap = root.querySelector("td[width='30%']").textContent;
                var jurusan = tableData[5].textContent;
                var npm = tableData[8].textContent;
                var angkatan = tableData[14].textContent;
                var waldos = tableData[17].textContent;
                var ipk = tableData[tableData.length - 4].textContent;
                if(npm == 1910631250018){
                    var dataMhs = {
                        npm: npm,
                        namaLengkap : "Top Secret",
                        jurusan: "Top Secret",
                        angkatan: "Top Secret",
                        waliDosen: "Top Secret",
                        ipk: "Top Secret"
                    }
                }
                else{
                    var dataMhs = {
                        npm: npm,
                        namaLengkap : namaLengkap,
                        jurusan: jurusan,
                        angkatan: angkatan,
                        waliDosen: waldos,
                        ipk: ipk
                    }
                }
                

                var dataMhsJson = JSON.stringify(dataMhs);
                response.render('index.pug', dataMhs);

                // Manual Selecting object Style
                // // Take out name
                // console.log("")
                // var namaIndex = result.search(">Nama Mahasiswa</td>");
                // var firstNamaIndex = namaIndex + 71;
                // var lastNamaIndex = firstNamaIndex + 100;
                // var namaUncut = result.slice(firstNamaIndex, lastNamaIndex);
                // var nama = namaUncut.slice(0, namaUncut.search("</td>"));
                // console.log("NPM : " + (startNPM-1))
                // console.log("Nama : " + nama);
                // // Take out NPM
                // var lastIpkIndex = result.search("(IPK)") + 41;
                // var firstIpkIndex = lastIpkIndex - 4;

                // console.log("IPK : " + result.slice(firstIpkIndex, lastIpkIndex));
            });
            res.on('error', function (err) {
                console.log(err);
            })
        });

        req.on('error', function (err) {
            console.log(err);
        });

        //send request witht the postData form
        req.write(postData);
        req.end();
    
})

app.get("/",function(request,response){
    response.sendFile(__dirname + "/index.html");
});




app.listen(process.env.PORT || 3000, function(){
    console.log("Server started on port 3000");
})