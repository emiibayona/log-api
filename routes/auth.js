const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const express = require("express");
const router = express.Router();
const controller = require("../controller/AuthController");
const jwt = require("jsonwebtoken"); // Asegúrate de tenerlo instalado

// --- CONFIGURACIÓN PASSPORT ---

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.CALLBACK_URL}/api/auth/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const state = JSON.parse(Buffer.from(req.query.state, "base64").toString())
        // Pasamos el profile al controlador para buscar o crear
        // Es mejor pasar directamente el profile que mutar el req.body
        const user = await controller.getUserOrCreate({ ...profile, tenant: state?.tenant });
        return done(null, user?.value || user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// No necesitamos serialize/deserialize si usamos JWT, 
// pero los dejamos si planeas mantener sesiones de Express.

// --- MIDDLEWARE DE PROTECCIÓN ---

function verifyToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    req.fromProfile = true;
    next();
  });
}

// --- RUTAS ---
router.get("/google", (req, res, next) => {
  const origin = req.query.origin || process.env.ORIGIN_DEFAULT_URL;
  const tenant = req.query.tenant || process.env.DEFAULT_TENANT;
  const redirect = req.query.redirect || process.env.ORIGIN_DEFAULT_URL;

  // Lo enviamos a Google codificado en Base64 dentro de 'state'
  const state = Buffer.from(JSON.stringify({ origin, tenant, redirect })).toString("base64");

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: state,
    prompt: "select_account", // Esto obliga a mostrar el selector de cuentas
  })(req, res, next);
});


router.post('/register', controller.createNotGoogle);

router.post('/login', controller.login);


// 2. Callback de Google
router.get(
  "/callback",
  passport.authenticate("google", { session: false }), // session false porque usaremos JWT
  (req, res) => {
    try {
      const state = req.query.state
        ? JSON.parse(Buffer.from(req.query.state, "base64").toString())
        : { origin: process.env.ORIGIN_DEFAULT_URL, tenant: process.env.DEFAULT_TENANT };

      const token = jwt.sign(
        { id: req.user.id, email: req.user.email, tenant: state.tenant },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.redirect(`${state.origin}/auth/success?token=${token}&redirect=${state.redirect}`);
    } catch (error) {
      res.redirect(`${state.origin}/info?error=auth_failed`);
    }
  }
);

router.get("/profile", verifyToken, controller.getUser);

router.get("/logout", (req, res) => {
  res.json({ message: "Clear your local storage token" });
});

router.patch("/user/update", verifyToken, controller.update);

module.exports = router;