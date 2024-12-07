import { check } from "k6";
import { post } from "./request.js";

export function login(identifier, password) {
  const start = new Date();
  const res = post("/api/login", {
    identifier,
    password,
  });
  const end = new Date();
  check(res, {
    "status is ok login": (r) => {
      console.log("status is ok|auth.js|" + r.status);
      return r.status >= 200 && r.status < 300
    },
  });

  const body = res.json();

  if (!body.body) {
    console.log(body);
  }

  check(body, {
    "there is a token is valid":
      () => {
        try{
          console.log("there is a token is valid|auth.js|" + body.body.token);
          console.log("query time" + body.body.querytime);
          console.log("api time" + end - start);

        } catch(e){}

        return body &&
        body.body &&
        body.body.token &&
        typeof body.body.token === "string"
      },
  });

  const token = body.body.token;

  return token;
}
