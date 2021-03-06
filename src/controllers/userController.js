import passport from "passport";
import routes from "../routes";
import User from "../models/User";

// Join
export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res, next) => {
  const { name, email, password, password2 } = req.body;
  if (password !== password2) {
    req.flash("error", "패스워드가 일치하지 않습니다!");
    res.status(400); // 요청에 대한 상태코드
    res.render("join", { pageTitle: "Join" });
  } else {
    // 사용자 등록 완료
    try {
      const user = await User({
        name,
        email,
        avatarUrl:
          "https://raw.githubusercontent.com/won-developer/img/master/not_profile.png"
      });
      await User.register(user, password);
      next();
    } catch (error) {
      res.redirect(routes.home);
    }
  }
};

// Login
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = passport.authenticate("local", {
  failureRedirect: routes.login,
  successRedirect: routes.home,
  successFlash: "로그인 성공!",
  failureFlash: "아이디 또는 비밀번호를 확인하세요!"
});

// Social Login
export const githubLogin = passport.authenticate("github");
export const githubLoginCallback = async (
  accessToken,
  refreshToken,
  profile,
  cb
) => {
  const { id, name, email } = profile._json;
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.githubId = id;
      user.save();
      return cb(null, user);
    }
    const newUser = await User.create({
      email,
      name,
      githubId: id,
      avatarUrl:
        "https://raw.githubusercontent.com/won-developer/img/master/not_profile.png"
    });
    return cb(null, newUser);
  } catch (error) {
    return cb(error);
  }
};
export const postGithubLogin = (req, res) => {
  res.redirect(routes.home);
};

export const kakaoLogin = passport.authenticate("kakao");
export const kakaoLoginCallback = async (
  accessToken,
  refreshToken,
  profile,
  done
) => {
  const { id } = profile._json;
  const { nickname } = profile._json.properties;
  const { email } = profile._json.kakao_account;

  try {
    const user = await User.findOne({ email });
    if (user) {
      user.kakaoId = id;
      user.save();
      return done(null, user);
    }
    const newUser = await User.create({
      email,
      name: nickname,
      avatarUrl:
        "https://raw.githubusercontent.com/won-developer/img/master/not_profile.png",
      kakaoId: id
    });
    return done(null, newUser);
  } catch (error) {
    return done(error);
  }
};
export const postKakaoLogin = (req, res) => {
  res.redirect(routes.home);
};

export const naverLogin = passport.authenticate("naver");
export const naverLoginCallback = async (
  accessToken,
  refreshToken,
  profile,
  done
) => {
  const { id, email, nickname } = profile._json;
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.naverId = id;
      user.save();
      return done(null, user);
    }
    const newUser = await User.create({
      email,
      name: nickname,
      avatarUrl:
        "https://raw.githubusercontent.com/won-developer/img/master/not_profile.png",
      naverId: id
    });
    return done(null, newUser);
  } catch (error) {
    done(error);
  }
};
export const postNaverLogin = (req, res) => {
  res.redirect(routes.home);
};

// Logout
export const logout = (req, res) => {
  req.logout(); // passport 사용시
  req.flash("success", "로그아웃 완료!");
  res.redirect(routes.home);
};

// User Detail
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate("videos");
  res.render("userDetail", { pageTitle: "User-Detail", user });
};
export const userDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate("videos");
    res.render("userDetail", { pageTitle: "User-Detail", user });
  } catch (error) {
    res.status(404);
    req.flash("error", "존재하지 않는 유저입니다.");
    res.redirect(routes.home);
  }
};

// Edit Profile
export const getEditProfile = (req, res) => {
  res.render("editProfile", { pageTitle: "Edit-Profile" });
};
export const postEditProfile = async (req, res) => {
  const { file } = req;
  const { id } = req.user;
  const { name } = req.body;
  try {
    await User.findByIdAndUpdate(
      { _id: id },
      { name, avatarUrl: file ? file.location : req.user.avatarUrl }
    );
    res.redirect(routes.me);
  } catch (error) {
    res.redirect(`${routes.users}${routes.editProfile}`);
  }
};

// Change Password
export const getChangePassword = (req, res) => {
  res.render("changePassword", { pageTitle: "Change-Password" });
};

export const postChangePassword = async (req, res) => {
  const { oldpassword, newpassword, newpassword1 } = req.body;
  try {
    if (newpassword !== newpassword1) {
      res.redirect(`/users${routes.changePassword}`);
      return;
    }
    await req.user.changePassword(oldpassword, newpassword);
    res.redirect(routes.me);
  } catch (error) {
    res.redirect(`/users${routes.changePassword}`);
  }
};
