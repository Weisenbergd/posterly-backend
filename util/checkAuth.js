import jwt from "jsonwebtoken";

function checkAuth(id, token) {
  if (id !== jwt.verify(token, process.env.SECRET)) return false;
  else return true;
}

export default checkAuth;
