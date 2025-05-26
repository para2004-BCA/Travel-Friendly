const User = require("../models/user");

module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs");
}
module.exports.signup = async(req,res)=>{
    try{
    let{username,email,password}=req.body;
    const newUser = new User({email,username});
    const registeredUser =await User.register(newUser,password);
   // console.log(registeredUser);
   req.login(registeredUser,(err)=>{
    if(err){
        return next(err);
    }
    req.flash("success","Welcome to wanderlust!");
    res.redirect("/listings");
   })
   }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    } 
}
module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
}
module.exports.login = async(req,res)=>{
 req.flash("success","welcome to wanderlust! you are loggend in!");
 let redirectUrl = res.locals.redirectUrl || "/listings";
 res.redirect(redirectUrl);
}
module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if (err){
            return next(err);
        }
        req.flash("success","You are logged out");
        res.redirect("/listings");
    });
}
module.exports.renderForgotPasswordForm = (req, res) => {
  res.render("users/forgot-password.ejs");
};
module.exports.resetPasswordForm = async (req, res) => {
  const { username, newPassword } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    req.flash("error", "No user found with that username.");
    return res.redirect("/forgot-password");
  }
  await user.setPassword(newPassword);
  await user.save();
  req.flash("success", "Password successfully reset! You can now log in.");
  res.redirect("/login");
};
