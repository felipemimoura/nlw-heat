import { Router } from "express";
import { AuthenticateUserController } from "./controllers/AuthenticateUserController";
import { ensureAuthenticated } from "./middleware/ensureAuthenticated";
import {CreateMessageController} from "./controllers/CreateMessageController"
import { Get3LastMessageController } from "./controllers/GetLast3MessageController";
import { ProfileUserCntroller } from "./controllers/ProfileUserController";


const router = Router()

router.post("/authenticate", new AuthenticateUserController().handle)

router.post("/messages", ensureAuthenticated, new CreateMessageController().handle)

router.get("/messages/last3", new Get3LastMessageController().handle)

router.get("/profile", ensureAuthenticated, new ProfileUserCntroller().handle)

export {router}