const mysqlcon = require('../../../config/db_connection');
const md5 = require('md5');


module.exports.changePassword = async (req,res)=>{
    let user = req.user
    let user_id = user.id
    let request = req.body
    
    try {

        let { password } = request
        let { confirmPassword } = request
        request.image = req.file.filename;

        if(password != confirmPassword){
            res.json(201,{message: "password and confirm password do not match"})
        }

        password = md5(password);

        sql = "UPDATE tbl_user SET password = ?,image = ? WHERE id = ?"
        let updated = await mysqlcon(sql,[password,request.image,user_id]);

        res.json(201,{
            message: "password changed",
            action : updated
        })


    } catch (error) {
        res.json(500,error)
    }
    finally {
        // res.send(bconnect);
        // // bconnect['message'] = 'Something went wrong';
        console.log("Execution completed.");
    } 
}