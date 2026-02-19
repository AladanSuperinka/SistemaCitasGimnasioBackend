const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  try {
    // Leer el header Authorization
    const header = req.headers.authorization;

    // Verificar que exista
    if (!header) {
      return res.status(401).json({ message: "Token requerido" });
    }

    // Separar "Bearer TOKEN"
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Formato de token inválido" });
    }

    // Verificar token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar info del usuario
    req.user = payload;

    // Continuar a la ruta
    next();

  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

module.exports = auth;
