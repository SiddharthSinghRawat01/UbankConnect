const loginController = require('../modules/login/Controller/loginController');
const payoutController = require('../modules/login/Controller/payoutController');
const dashbordController = require('../modules/login/Controller/dashbordController');
const route = require("express").Router();
const path = require("path");
const multer = require("multer");

var storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, path.join(__dirname,'../images'));
    },
    filename : function(req, file, cb){
        let imgname = new Date().toString();
        imgname = imgname.replace(/ |:|\+|\(|\)/gi, '-');
        let imgext = path.extname(file.originalname);
        let image = `${imgname}${imgext}`;
        cb(null, image);
    }
})
const uploads = multer({ storage: storage });

const helper = require("../helper/jwt");
const username = require("../helper/username");
const dashboardCount = require('../modules/login/Controller/dashbordController');
// const email_validate = require("../helper/email-validation");

const views = (path.join(__dirname , '../views/'));

// routes
route.get('/', (req, res)=>{
    console.log(views);
    res.sendFile(views + 'index.html');
});

route.post('/register', uploads.none(), loginController.register);
route.post('/save-company-profile', uploads.none(),  helper.verify, loginController.company_profile);

route.post('/login', uploads.none(), loginController.login);

// country of incorporation 
route.post('/country-list', uploads.none(), helper.verify, loginController.get_countries);
route.post('/solution-apply', uploads.none(), helper.verify, loginController.get_solution_apply);
route.post('/save-country-solution-apply', uploads.none(), helper.verify, loginController.save_country_solution_apply);
route.post('/save-director-info', uploads.none(), helper.verify, loginController.save_director_info);


//,
// route.post('/user-login', uploads.none(), userController.login);
// route.post('/user-list', uploads.none(), helper.verify, userController.get_users);

route.post('/sqltest', uploads.none(), helper.verify, loginController.testsql);

// dashboard controller

route.get('/payout',uploads.none(),helper.verify, dashbordController.payout);


module.exports = route;