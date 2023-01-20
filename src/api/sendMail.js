require("dotenv").config();
const sendOneMail = (app, verifyToken, verifyAdmin) => {
    app.post("/sendSingleMail", verifyToken, verifyAdmin, async (req, res) => {
        const mailData = req.body ;
        const nodemailer = require("nodemailer");
        async function main() {
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.mailUser,
                    pass: process.env.mailPassword,
                },
            }); 

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"Subrota chandra portfolio 👻" <subrota45278@gmail.com>', // sender address
                to: mailData?.to, // list of receivers
                subject: `${mailData?.subject} ✔`, // Subject line
                html: `<div style="height: auto; width: 80%;background-color: #09053D;color: white;font-size: 17px;padding: 12px;border-radius: 12px; margin: auto; font-family: serif;font-weight: bold;"> 
                  <p>   ${mailData?.message}  </p>
                  <a href="https://portfolio-of-subrota-chandra.firebaseapp.com/" target="_blank" >

                  <img src="https://i.ibb.co/DLcFkNd/mylogo.png" alt="logo" 
                  style="height: 80px; width: 120px; border-radius: 50%; display: inline-block; margin: 20px;" />
                     
                 </a>
                </div>`, 
            });

            if (info.messageId) {
                return res.send({message:"sended"})
            }else{
                return res.send({message:"failed"}) 
            }
        }

        main().catch(console.error);
    })
};

//

module.exports = { sendOneMail };