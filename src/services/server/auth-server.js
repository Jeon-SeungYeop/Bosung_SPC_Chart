import axios from "axios";

const authServerConfig = (server) => {
  server.post(
    "/register",
    (schema, request) => {
      const requestData = JSON.parse(request.requestBody);
      const { email, password } = requestData;

      // Check if the email already exists
      const existingUser = schema.users.findBy({ email });
      if (existingUser) {
        return new Response(400, {}, { error: "Email is already registered" });
      }

      // Create a new user
      const user = schema.users.create({
        email,
        password,
      });

      // Generate a fake JWT token
      const token = "fake-token";

      return {
        token,
        user: user.attrs,
      };
    }
    // { timing: 2000 }
  );

  // Login route
  // server.post(
  //   "/",
  //   (schema, request) => {
  //     const requestData = JSON.parse(request.requestBody);
  //     const { email, password } = requestData;

  //     // Find the user by email
  //     const user = schema.users.findBy({ email });

  //     if (!user) {
  //       return new Response(400, {}, { error: "Invalid credentials" });
  //     }

  //     if (user.password !== password) {
  //       return new Response(400, {}, { error: "Invalid credentials" });
  //     }

  //     // Generate a fake JWT token
  //     const token = "fake-token";

  //     return {
  //       token,
  //       user: user.attrs,
  //     };
  //   }
  //   // { timing: 2000 }
  // );

  // custom Login route
  server.post(
    "/",
    (schema, request) => {
      const requestData = JSON.parse(request.requestBody);
      const { email, password } = requestData;

      axios.post('/login-check', {
        userid: email,
        password: password
      })
      .then(function (response) {
        const responseData = JSON.parse(response);
        console.log(responseData);
      })
      .catch(function (error) {
        console.log(error);
      });

      // Find the user by email
      const user = schema.users.findBy({ email });

      if (!user) {
        return new Response(400, {}, { error: "Invalid credentials" });
      }

      if (user.password !== password) {
        return new Response(400, {}, { error: "Invalid credentials" });
      }

      // Generate a fake JWT token
      const token = "fake-token";

      return {
        token,
        user: user.attrs,
      };
    }
    // { timing: 2000 }
  );
  server.post("/logout", () => {
    return {};
  });
};

export default authServerConfig;
