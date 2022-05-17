const config = require("../../../config/config");
const bcrypt = require("bcrypt");
const fs  = require("fs");
const path = require("path");
const emailvalidator = require("email-validator");
const otpGenerator = require('otp-generator');
var dateTime = require('node-datetime');
var md5 = require('md5');

const nodemailer = require('nodemailer');
const ejs = require('ejs');
const cors = require('cors');
 
const user_send_email = require("../../../helper/send-mail");
var dt = dateTime.create();
var formatted_date = dt.format('Y-m-d H:M:S');
console.log(formatted_date);


const filepath = path.join(__dirname,"../uploads");
const jwt = require("jsonwebtoken");
const email_validate = require("../../../helper/email-validation");
const mysqlcon = require('../../../config/db_connection');
const { exit } = require("process");

console.log(mysqlcon);
const loginCont = { 
    register: async function(req, res){ 
        // var url = 'google.com';
        // var email = 'rmanjeetchauhan@gmail.com';
        // user_send_email.mail(url, email); 
        //  return true;
        var bconnect = {};
        try{
            var request = req.body;
            // console.log(request);
            if(request){
                if(request.email && emailvalidator.validate(request.email)){
                    var password = request.password;
                    if(password){ 
                        if(request.email != request.confirm_email){
                            res.status(201).json({status:false, message:'Email and confirm email not match', data: []}); 
                            return true;
                        }
                        if(request.password != request.confirm_password){
                            res.status(201).json({status:false, message:'Password and confirm password not match', data: []}); 
                            return true;
                        }
                        var em = {email: request.email} 
                        var user_id = request.user_id;
                        var sql = 'select id, email from tbl_user where ? ';
                        if(user_id){
                            sql = 'select id, email from tbl_user where email = ? AND id != ?';
                            var em = [request.email, request.user_id];
                        }
                        var dbquery  = await mysqlcon(sql, em)
                            // console.log(dbquery);
                            // console.log(err);
                            //  console.log(dbquery[0]);
                            //  console.log('1');  
                            
                            if(!dbquery[0]){ 
                                if(user_id){
                                    var user_data = {  
                                        email : request.email,
                                        password : md5(request.password), 
                                        updated_on : formatted_date, 
                                    };
                                    sql = 'UPDATE tbl_user SET ? WHERE id = ? ';
                                    var dbquery  = await mysqlcon(sql, [user_data, user_id])
                                    if(!dbquery){
                                        res.status(201).json({status:false, message:'Error to create profile', data: []});  
                                    }
                                    else{

                                        res.status(200).json({status:true, message:'Profile saved successfully', data: dbquery.insertId});  
                                    }
                                    
                                }
                                else{
                                    // console.log('2');      
                                    var secret_key = otpGenerator.generate(8, { upperCaseAlphabets: true, specialChars: false });
                                    var test_secret_key = otpGenerator.generate(8, { upperCaseAlphabets: true, specialChars: false });
                                    var token = otpGenerator.generate(8, { upperCaseAlphabets: true, specialChars: false });
                                    
                                    // console.log('secret_key', secret_key);
                                    // console.log('test_secret_key', test_secret_key);
                                    // console.log('token', token);
                                    var user_data = { 
                                        parent_id : 0,
                                        account_type : 1,
                                        email : request.email,
                                        password : md5(request.password),
                                        status : 0,
                                        secretkey : secret_key,
                                        test_secretkey : test_secret_key,
                                        created_on : formatted_date,
                                        updated_on : formatted_date,
                                        verification_token : token 
                                    };

                                    let result = await mysqlcon('INSERT INTO tbl_user SET ?', user_data);
                                    if(!result){
                                        res.status(201).json({status:false, message:'Error to create profile', data: []});  
                                    }
                                    else{
                                        jwt.sign({id:result.insertId},config.JWT_SECRET,{expiresIn:config.JWT_EXPIRY},(err,token)=>{
                                            if(err) throw new Error(err);
                                            var reg = {
                                                id: result.insertId,
                                                user_id : result.insertId,
                                                token : token,
                                            };                                                
                                            res.status(200).json({status:false, message:'Profile created successfully', data: reg}); 
                                        }); 
                                    }
                                }  
                            }
                            else{
                                res.status(202).json({status:false, message:'Email id already exists', data:  []}); 
                            }
                    }
                    else{ 
                        res.status(201).json({status:false, message:'Enter a valid password', data: [] }); 
                    } 
                }
                else{
                    res.status(201).json({status:false, message:'Enter a valid email id', data: [] }); 
                }
            }
            else{
                res.status(201).json({status:false, message:'Enter a valid email id and password', data: [] }); 
            }
        }
        catch(e) {
            console.log(e)
            res.status(500).json({status:false, message:'Error to complete task.', data: [] }); 
        }
        finally {
            // res.send(bconnect);
            // // bconnect['message'] = 'Something went wrong';
            console.log("Execution completed.");
        } 
    },

    company_profile: async function(req, res){ 
        let user = req.user; 
        // res.send(users);
        var bconnect = {};
        try{
            var request = req.body;
            // console.log(request); 
            if(request){
                var validate_req = ['company_name', 'trading_dba', 'registered_address', 'company_registration_no', 'country_of_incorporation', 'main_contact_person', 'main_contact_email'];
                var req_str = '';
                var req_arr = [];
                for (const key  in validate_req) {
                    // console.log(request[validate_req[key]]);
                    if(!request[validate_req[key]] ){ 
                        req_str += ('<p>'+ validate_req[key]  + ' is required </p>');
                        req_arr.push( validate_req[key]);
                    }
                }
            
                if(req_arr.length > 0){     
                    // console.log('hdfgghgf', req_arr);               
                    res.status(201).json({status:false, message: req_str, data: req_arr}); 
                    return true;
                } 
                 
                var user_id = user.id;
                var company_data = { 
                    bname :  request.company_name, 
                    trading_dba :  request.trading_dba,
                    blocation : request.registered_address,
                    busines_Code : request.company_registration_no,
                    busines_Country : request.country_of_incorporation,
                    name : request.main_contact_person,
                    main_contact_email : request.main_contact_email,
                    fname : request.main_contact_person,
                    lname : request.main_contact_person,
                    updated_on : formatted_date,
                };

                sql = 'UPDATE tbl_user SET ? WHERE id = ? ';
                let dbquery  = await mysqlcon(sql, [company_data, user_id]);
                // console.log(dbquery.sql);
                if(dbquery){                    
                    res.status(200).json({status:true, message:'Saved successfully', data: []});  
                }            
               
            }
            else{
                res.status(201).json({status:false, message:'All company profile data are required', data: [] }); 
            }
        }
        catch(e) {
            res.status(500).json({status:false, message:'Error to complete task.', data: [] }); 
        }
        finally {
            console.log("Execution completed.");
        } 
    },

    save_country_solution_apply: async function(req, res){ 
        let user = req.user; 
        // res.send(users);
        var bconnect = {};
        try{
            var request = req.body;
            console.log(request); 
            if(request){
                var validate_req = ['solution_apply_for_country', 'mode_of_solution'];
                var req_str = '';
                var req_arr = [];
                for (const key  in validate_req) {
                    // console.log(request[validate_req[key]]);
                    if(!request[validate_req[key]] ){ 
                        req_str += ('<p>'+ validate_req[key]  + ' is required </p>');
                        req_arr.push( validate_req[key]);
                    }
                }
                
                if(req_arr.length > 0){     
                    // console.log('hdfgghgf', req_arr);               
                    res.status(201).json({status:false, message: req_str, data: req_arr}); 
                    return true;
                } 
                // console.log('kdfhksdfhkjsh', request.mode_of_solution.join());
                // return true;
                 
                var user_id = user.id;
                var company_data = { 
                    solution_apply_for_country :  request.solution_apply_for_country.join(), 
                    mode_of_solution :  request.mode_of_solution.join()
                };

                sql = 'UPDATE tbl_user SET ? WHERE id = ? ';
                var dbquery  = mysqlcon(sql, [company_data, user_id]);
                    // console.log(dbquery.sql);
                    if(dbquery){                    
                        res.status(200).json({status:true, message:'Saved successfully', data: []});  
                    }
               
            }
            else{
                res.status(201).json({status:false, message:'Company and apply solution data are required', data: [] }); 
            }
        }
        catch(e) {
            res.status(500).json({status:false, message:'Error to complete task.', data: [] }); 
        }
        finally {
            console.log("Execution completed.");
        } 
    },


    save_director_info: async function(req, res){ 
        let user = req.user; 
        // res.send(users);
        var bconnect = {};
        try{
            var request = req.body;
            console.log(request); 
            if(request){
                var validate_req = ['director1_name', 'director1_dob' , 'director1_nationality'];
                var req_str = '';
                var req_arr = [];
                for (const key  in validate_req) {
                    // console.log(request[validate_req[key]]);
                    if(!request[validate_req[key]] ){ 
                        req_str += ('<p>'+ validate_req[key]  + ' is required </p>');
                        req_arr.push( validate_req[key]);
                    }
                }
                
                if(req_arr.length > 0){     
                    // console.log('hdfgghgf', req_arr);               
                    res.status(201).json({status:false, message: req_str, data: req_arr}); 
                    return true;
                } 
                // console.log('kdfhksdfhkjsh', request.mode_of_solution.join());
                // return true;
                 
                var user_id = user.id;

                var director_info = { 
                    director1_name :  request.director1_name, 
                    director1_dob :  request.director1_dob,
                    director1_nationality : request.director1_nationality,
                    director2_name : request.director2_name,
                    director2_dob : request.country_of_incorporation,
                    director2_nationality : request.director2_dob,
                    main_contact_email : request.director2_nationality, 
                    updated_on : formatted_date,
                }; 

                sql = 'UPDATE tbl_user SET ? WHERE id = ? ';
                var dbquery  = mysqlcon(sql, [director_info, user_id])
                    // console.log(dbquery.sql);
                    if(dbquery){                    
                        res.status(200).json({status:true, message:'Saved successfully', data: []});  
                    }
                
            }
            else{
                res.status(201).json({status:false, message:'Director informations are required', data: [] }); 
            }
        }
        catch(e) {
            res.status(500).json({status:false, message:'Error to complete task.', data: [] }); 
        }
        finally {
            console.log("Execution completed.");
        } 
    },

    save_shareholder_info: async function(req, res){ 
        let user = req.user; 
        // res.send(users);
        var bconnect = {};
        try{
            var request = req.body;
            console.log(request); 
            if(request){
                var validate_req = ['shareholder1_name', 'shareholder1_dob' , 'shareholder1_nationality'];
                var req_str = '';
                var req_arr = [];
                for (const key  in validate_req) {

                    // console.log(request[validate_req[key]]);
                    if(!request[validate_req[key]] ){ 
                        req_str += ('<p>'+ validate_req[key]  + ' is required </p>');
                        req_arr.push( validate_req[key]);
                    }
                    
                }
                
                if(req_arr.length > 0){     
                    // console.log('hdfgghgf', req_arr);               
                    res.status(201).json({status:false, message: req_str, data: req_arr}); 
                    return true;
                } 
                // console.log('kdfhksdfhkjsh', request.mode_of_solution.join());
                // return true;
                 
                var user_id = user.id;

                var shareholder_info = { 
                    shareholder1_name :  request.shareholder1_name, 
                    shareholder1_dob :  request.shareholder1_dob,
                    shareholder1_nationality : request.shareholder1_nationality,
                    shareholder2_name : request.shareholder2_name,
                    shareholder2_dob : request.country_of_incorporation,
                    shareholder2_nationality : request.shareholder2_dob,
                    main_contact_email : request.shareholder2_nationality, 
                    updated_on : formatted_date,
                }; 

                sql = 'UPDATE tbl_user SET ? WHERE id = ? ';
                var dbquery  = mysqlcon(sql, [shareholder_info, user_id])
                    // console.log(dbquery.sql);
                    if(dbquery){                    
                        res.status(200).json({status:true, message:'Saved successfully', data: []});  
                    }               
            }
            else{
                res.status(201).json({status:false, message:'Shareholder informations are required', data: [] }); 
            }
        }
        catch(e) {
            res.status(500).json({status:false, message:'Error to complete task.', data: [] }); 
        }
        finally {
            console.log("Execution completed.");
        } 
    },

    save_business_info: async function(req, res){ 
        let user = req.user; 
        // res.send(users);
        var bconnect = {};
        try{
            var request = req.body;
            console.log(request); 
            if(request){
                var validate_req = ['company_website_processing_url', 'company_nature_of_business' , 'company_estimated_monthly_volume', 'company_avarage_ticket_size'];
                var req_str = '';
                var req_arr = [];
                for (const key  in validate_req) {
                    // console.log(request[validate_req[key]]);
                    if(!request[validate_req[key]] ){ 
                        req_str += ('<p>'+ validate_req[key]  + ' is required </p>');
                        req_arr.push( validate_req[key]);
                    }
                }
                
                if(req_arr.length > 0){     
                    // console.log('hdfgghgf', req_arr);               
                    res.status(201).json({status:false, message: req_str, data: req_arr}); 
                    return true;
                } 
                // console.log('kdfhksdfhkjsh', request.mode_of_solution.join());
                // return true;
                 
                var user_id = user.id; 

                var business_info = { 
                    website :  request.company_website_processing_url, 
                    job_title :  request.company_nature_of_business,
                    company_estimated_monthly_volume : request.company_estimated_monthly_volume,
                    company_avarage_ticket_size : request.company_avarage_ticket_size, 
                    updated_on : formatted_date,
                }; 

                sql = 'UPDATE tbl_user SET ? WHERE id = ? ';
                var dbquery  = mysqlcon.query(sql, [business_info, user_id]);
                    // console.log(dbquery.sql);
                    if(dbquery){                    
                        res.status(200).json({status:true, message:'Saved successfully', data: []});  
                    }
            
            }
            else{
                res.status(201).json({status:false, message:'Business informations are required', data: [] }); 
            }
        }
        catch(e) {
            res.status(500).json({status:false, message:'Error to complete task.', data: [] }); 
        }
        finally {
            console.log("Execution completed.");
        } 
    },

    save_settelment_info: async function(req, res){ 
        let user = req.user; 
        // res.send(users);
        var bconnect = {};
        try{
            var request = req.body;
            console.log(request); 
            if(request){ 

                var validate_req = ['international_settelment_currency'];
                var req_str = '';
                var req_arr = [];
                for (const key  in validate_req) {
                    // console.log(request[validate_req[key]]);
                    if(!request[validate_req[key]] ){ 
                        req_str += ('<p>'+ validate_req[key]  + ' is required </p>');
                        req_arr.push( validate_req[key]);
                    }
                }
                
                if(req_arr.length > 0){     
                    // console.log('hdfgghgf', req_arr);               
                    res.status(201).json({status:false, message: req_str, data: req_arr}); 
                    return true;
                } 
              
                var user_id = user.id;  

                var settelment_info = { 
                    settle_currency :  request.international_settelment_currency, 
                    wallet_url :  request.usdt_wallet_address, 
                    complete_profile :  1, 
                    updated_on : formatted_date,
                }; 

                sql = 'UPDATE tbl_user SET ? WHERE id = ? ';
                var dbquery  = mysqlcon.query(sql, [settelment_info, user_id])
                    // console.log(dbquery.sql);
                    if(dbquery){                    
                        res.status(200).json({status:true, message:'Saved successfully', data: []});  
                    }              
            }
            else{
                res.status(201).json({status:false, message:'Settelment informations are required', data: [] }); 
            }
        }
        catch(e) {
            res.status(500).json({status:false, message:'Error to complete task.', data: [] }); 
        }
        finally {
            console.log("Execution completed.");
        } 
    },

    login: async function(req,res){
        const request  = req.body;
        if(request){
            try{
                if(request.email && emailvalidator.validate(request.email)){
                    var password = request.password;
                    if(password){ 
                        sql = 'SELECT  * FROM tbl_user where email = ? AND password = ?';
                        var dbquery  = await mysqlcon.query(sql, [request.email, md5(request.password)])
                            if(err){  
                                // console.log('Query : ', dbquery.sql);
                                res.status(201).json({status:false, message:'Something went wrong', data: []}); 
                            }
                            if(dbquery[0]){ 
                                if(dbquery[0].complete_profile == 1){
                                    if(dbquery[0].status == 1){
                                        // console.log(dbquery);
                                    let token = await jwt.sign({id:dbquery[0].id},config.JWT_SECRET,{expiresIn:config.JWT_EXPIRY})
                                            if(err) throw new Error(err);
                                            dbquery[0]['token'] = token;
                                            res.status(202).json({status:false, message:'Login successfully', data: dbquery[0]}); 
                                        
                                    }
                                    else{
                                        res.status(201).json({status:false, message:'Your profile is active now, It is in under-review wait 24 hours.', data:  []});
                                    }
                                }
                                else{
                                    res.status(201).json({status:false, message:'Your profile is not complete.', data:  []});
                                }
                            }
                            else{
                                res.status(201).json({status:false, message:'You entered a wrong credentials.', data:  []}); 
                            }
                        
                    }
                    else{ 
                        res.status(201).json({status:false, message:'Enter a valid password', data: [] }); 
                    } 
                }
                else{
                    res.status(201).json({status:false, message:'Enter a valid email id', data: [] }); 
                }
            }
            catch(e) {
                res.status(500).json({status:false, message:'Error to complete task.', data: [] }); 
            }
            finally {
                // res.send(bconnect);
                // // bconnect['message'] = 'Something went wrong';
                console.log("Execution completed.");
            }
        }
        else{
            res.status(201).json({status:false, message:'Enter valid email and password', data: [] }); 
        }
    },

    get_countries: async function(req, res){
        // console.log('solution : ', req.user);
        try{
            let users = req.user; 
            if(users){
                sql = 'SELECT * FROM countries WHERE 1 ORDER BY name ASC';
                var dbquery  = await mysqlcon(sql);
                    if(dbquery){  
                        res.status(200).json({status:false, message:'Country list get successfully', data: dbquery});                        
                    }                

            }
            else{ 
                res.status(201).json({status:false, message:'Authentication Failed.', data: [] }); 
            } 
        }
        catch(e) {
            res.status(500).json({status:false, message:'Error to complete task.', data: [] }); 
        }
        finally {
            // res.send(bconnect);
            // // bconnect['message'] = 'Something went wrong';
            console.log("Execution completed.");
        } 
    },
 
    get_solution_apply: async function(req, res){
        // console.log('solution : ', req.user);
        try{
            let users = req.user; 
            if(users){
                sql = 'SELECT  * FROM countries where status = 1';
                var results  = await mysqlcon(sql);
                    if(err){  
                        // console.log('Query : ', results.sql);
                        res.status(201).json({status:false, message:'Solution apply countries not found', data: []}); 
                    }
                    if(results){
                        sql = 'SELECT  * FROM payment_method where status = 1';
                        var payment_method  = mysqlcon(sql)
                            if(err){  
                                // console.log('Query : ', payment_method.sql);
                                res.status(201).json({status:false, message:'Solution apply countries not found', data: []}); 
                            }
                            if(payment_method){ 
                                
                                // console.log(payment_method);
                                for (const result in results) {
                                    // console.log(result);  
                                    // console.log(results[result].support_payment_method);  
                                    var local = [];
                                    var pay_method = results[result].support_payment_method.split(',');
                                    for (const pmethod in payment_method) {
                                        // console.log(payment_method[pmethod].id, pay_method);
                                        if(pay_method.includes(payment_method[pmethod].id + '')){
                                            // console.log('innnnnn');
                                            // console.log(payment_method[pmethod]);
                                            local.push(payment_method[pmethod]);
                                        } 
                                    }
                                    results[result].support_method = local; 
                                }
                                res.status(200).json({status:false, message:'Solution Countries and solution apply are get successfully', data: results});
                            }
                    }
                
            }
            else{ 
                res.status(201).json({status:false, message:'Authentication Failed.', data: [] }); 
            } 
        }
        catch(e) {
            res.status(500).json({status:false, message:'Error to complete task.', data: [] }); 
        }
        finally {
            // res.send(bconnect);
            // // bconnect['message'] = 'Something went wrong';
            console.log("Execution completed.");
        } 
    },
  
    testsql : async function(req, res){
        let results = await mysqlcon('SELECT *from user');
        if (error) throw error;
            console.log('The error: ', error );
            // console.log('The result: ', results );
            // console.log('fields: ', fields );
            res.send(results);
        
    }
}


module.exports = loginCont;