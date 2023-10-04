/// Initial Project Setup ///
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
/// Middlewares ///
const notFoundMiddleware = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error");
const rateLimitMiddleware = require("./middleware/rate-limit");
const morgan = require("morgan");
/// Routes////
const authRoute = require('./routes/auth-route');
const userRoute = require('./routes/user-route')
/////////////////////////////
app.use(cors());
app.use(morgan("dev"));
app.use(rateLimitMiddleware);
app.use(express.json());


app.use("/auth", authRoute);
app.use('/user',userRoute)

app.use(notFoundMiddleware);
app.use(errorMiddleware);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`############ Server is ready on port`, +PORT, "############");
});
